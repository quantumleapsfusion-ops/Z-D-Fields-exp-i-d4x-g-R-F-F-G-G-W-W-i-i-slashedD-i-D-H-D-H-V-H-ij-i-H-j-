import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  aiUsageEvent: {
    aggregate: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({ prisma, db: prisma }));

async function load(envOverrides: Record<string, string> = {}) {
  vi.resetModules();
  for (const [k, v] of Object.entries(envOverrides)) vi.stubEnv(k, v);
  return import("@/lib/ai/budget");
}

beforeEach(() => {
  vi.unstubAllEnvs();
  prisma.aiUsageEvent.aggregate.mockReset();
  prisma.aiUsageEvent.count.mockReset();
  prisma.aiUsageEvent.create.mockReset();
});

describe("estimateCostMicros", () => {
  it("prices known models from the default table", async () => {
    const { estimateCostMicros } = await load();
    // 1M input @ $3 + 1M output @ $15 = $18 = 18_000_000 micros
    expect(
      estimateCostMicros("claude-sonnet-5", {
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
      }),
    ).toBe(BigInt(18_000_000));
  });

  it("prices unknown models like the heavy tier", async () => {
    const { estimateCostMicros } = await load();
    const unknown = estimateCostMicros("mystery-model", {
      inputTokens: 1000,
      outputTokens: 1000,
    });
    const heavy = estimateCostMicros("claude-fable-5-1", {
      inputTokens: 1000,
      outputTokens: 1000,
    });
    expect(unknown).toBe(heavy);
    expect(unknown).toBe(BigInt(90_000));
  });

  it("honours AI_MODEL_PRICES_JSON overrides and ignores malformed JSON", async () => {
    const overridden = await load({ AI_MODEL_PRICES_JSON: '{"claude-sonnet-5":[1,1]}' });
    expect(
      overridden.estimateCostMicros("claude-sonnet-5", {
        inputTokens: 10,
        outputTokens: 10,
      }),
    ).toBe(BigInt(20));

    const broken = await load({ AI_MODEL_PRICES_JSON: "not json" });
    expect(
      broken.estimateCostMicros("claude-sonnet-5", { inputTokens: 10, outputTokens: 10 }),
    ).toBe(BigInt(180));
  });
});

describe("currentMonthKey", () => {
  it("formats the UTC year-month with zero padding", async () => {
    const { currentMonthKey } = await load();
    expect(currentMonthKey(new Date("2026-03-05T23:59:59Z"))).toBe("2026-03");
    expect(currentMonthKey(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
  });
});

describe("monthlySpendUsd", () => {
  it("converts summed micro-dollars to USD and treats null as zero", async () => {
    const { monthlySpendUsd } = await load();
    prisma.aiUsageEvent.aggregate.mockResolvedValueOnce({
      _sum: { costMicros: BigInt(2_500_000) },
    });
    await expect(monthlySpendUsd()).resolves.toBe(2.5);
    prisma.aiUsageEvent.aggregate.mockResolvedValueOnce({ _sum: { costMicros: null } });
    await expect(monthlySpendUsd()).resolves.toBe(0);
  });
});

describe("assertAiAllowance", () => {
  function arrange(minute: number, day: number, spentMicros: number) {
    prisma.aiUsageEvent.count.mockResolvedValueOnce(minute).mockResolvedValueOnce(day);
    prisma.aiUsageEvent.aggregate.mockResolvedValue({
      _sum: { costMicros: BigInt(spentMicros) },
    });
  }

  it("passes when under every limit", async () => {
    const { assertAiAllowance } = await load({
      AI_RATE_LIMIT_PER_MINUTE: "10",
      AI_RATE_LIMIT_PER_DAY: "200",
      AI_MONTHLY_SPEND_CAP_USD: "50",
    });
    arrange(1, 5, 1_000_000);
    await expect(assertAiAllowance("u1")).resolves.toBeUndefined();
  });

  it("throws 429 at the per-minute limit", async () => {
    const { assertAiAllowance, AiBudgetError } = await load({
      AI_RATE_LIMIT_PER_MINUTE: "3",
    });
    arrange(3, 3, 0);
    const err = await assertAiAllowance("u1").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(429);
  });

  it("throws 429 at the daily limit", async () => {
    const { assertAiAllowance, AiBudgetError } = await load({
      AI_RATE_LIMIT_PER_MINUTE: "10",
      AI_RATE_LIMIT_PER_DAY: "20",
    });
    arrange(0, 20, 0);
    const err = await assertAiAllowance("u1").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(429);
  });

  it("throws 402 once the monthly cap is spent", async () => {
    const { assertAiAllowance, AiBudgetError } = await load({
      AI_MONTHLY_SPEND_CAP_USD: "5",
    });
    arrange(0, 0, 5_000_000);
    const err = await assertAiAllowance("u1").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(402);
  });
});
