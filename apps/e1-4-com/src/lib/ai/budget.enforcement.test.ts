import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakePrisma, type FakePrisma } from "@/test/fake-prisma";
import { stubEnv } from "@/test/stub-env";

const state = vi.hoisted(() => ({
  fake: null as unknown as FakePrisma,
  model: null as null | {
    name: string;
    model: string;
    complete: ReturnType<typeof vi.fn>;
  },
}));

vi.mock("@/lib/db", () => ({
  get prisma() {
    return state.fake.prisma;
  },
  get db() {
    return state.fake.prisma;
  },
}));

vi.mock("@/lib/llm", () => ({
  getLanguageModel: vi.fn(() => state.model),
}));

const USER = "user-a";
const OTHER = "user-b";
const NOW = Date.UTC(2026, 8, 15, 12, 0, 0); // 2026-09-15T12:00Z

async function loadBudget(env: Record<string, string | undefined> = {}) {
  stubEnv({
    AI_RATE_LIMIT_PER_MINUTE: "3",
    AI_RATE_LIMIT_PER_DAY: "5",
    AI_MONTHLY_SPEND_CAP_USD: "10",
    ...env,
  });
  return import("@/lib/ai/budget");
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  state.fake = createFakePrisma(() => Date.now());
  state.model = null;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("estimateCostMicros", () => {
  it("prices known models from the table (tokens × USD per 1M = micro-dollars)", async () => {
    const { estimateCostMicros } = await loadBudget();
    // claude-sonnet-5: $3 in / $15 out per 1M tokens
    expect(
      estimateCostMicros("claude-sonnet-5", { inputTokens: 1_000_000, outputTokens: 0 }),
    ).toBe(BigInt(3_000_000));
    expect(
      estimateCostMicros("claude-sonnet-5", { inputTokens: 1000, outputTokens: 1000 }),
    ).toBe(BigInt(18_000));
  });

  it("prices unknown models at the heavy tier so untracked models cannot be cheap", async () => {
    const { estimateCostMicros } = await loadBudget();
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
    let mod = await loadBudget({ AI_MODEL_PRICES_JSON: '{"gpt-4o":[100,200]}' });
    expect(mod.estimateCostMicros("gpt-4o", { inputTokens: 10, outputTokens: 10 })).toBe(
      BigInt(3000),
    );

    mod = await loadBudget({ AI_MODEL_PRICES_JSON: "not json" });
    expect(mod.estimateCostMicros("gpt-4o", { inputTokens: 10, outputTokens: 10 })).toBe(
      BigInt(125),
    );
  });
});

describe("currentMonthKey", () => {
  it("uses the UTC calendar month", async () => {
    const { currentMonthKey } = await loadBudget();
    expect(currentMonthKey(new Date(Date.UTC(2026, 0, 1, 0, 0, 0)))).toBe("2026-01");
    expect(currentMonthKey(new Date(Date.UTC(2026, 11, 31, 23, 59, 59)))).toBe("2026-12");
  });
});

describe("assertAiAllowance — per-user rate limits", () => {
  it("allows a user under every limit", async () => {
    const { assertAiAllowance } = await loadBudget();
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
  });

  it("rejects with 429 once the per-minute limit is reached (>= not >)", async () => {
    const { assertAiAllowance, AiBudgetError } = await loadBudget();
    for (let i = 0; i < 3; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 10_000 * (i + 1)) });

    const err = await assertAiAllowance(USER).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(429);
    expect((err as Error).message).toMatch(/wait a minute/i);
  });

  it("uses a rolling 60 s window: calls older than a minute do not count", async () => {
    const { assertAiAllowance } = await loadBudget();
    for (let i = 0; i < 3; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 61_000 - i) });
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
  });

  it("rejects with 429 once the daily limit is reached even if the minute window is clear", async () => {
    const { assertAiAllowance, AiBudgetError } = await loadBudget();
    for (let i = 0; i < 5; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 3_600_000 * (i + 1)) });

    const err = await assertAiAllowance(USER).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(429);
    expect((err as Error).message).toMatch(/daily/i);
  });

  it("uses a rolling 24 h window for the daily limit", async () => {
    const { assertAiAllowance } = await loadBudget();
    for (let i = 0; i < 5; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 86_400_001 - i) });
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
  });

  it("scopes rate limits per user: another user's traffic never unblocks or blocks me", async () => {
    const { assertAiAllowance, AiBudgetError } = await loadBudget();
    for (let i = 0; i < 10; i++)
      state.fake.seed({ userId: OTHER, createdAt: new Date(NOW - 1000 * (i + 1)) });

    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
    await expect(assertAiAllowance(OTHER)).rejects.toBeInstanceOf(AiBudgetError);
  });

  it("does not let a user bypass by spoofing a similar id", async () => {
    const { assertAiAllowance } = await loadBudget();
    for (let i = 0; i < 3; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 1000 * (i + 1)) });

    await expect(assertAiAllowance(USER)).rejects.toMatchObject({ status: 429 });
    // Only an *exact* id match is counted — a different id is a different user.
    expect(state.fake.prisma.aiUsageEvent.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: USER }) }),
    );
  });

  it("reads limits from env and applies zero as a hard block", async () => {
    const { assertAiAllowance } = await loadBudget({ AI_RATE_LIMIT_PER_MINUTE: "0" });
    await expect(assertAiAllowance(USER)).rejects.toMatchObject({ status: 429 });
  });

  it("falls back to the default limits when env values are not numbers", async () => {
    const { assertAiAllowance } = await loadBudget({
      AI_RATE_LIMIT_PER_MINUTE: "lots",
      AI_RATE_LIMIT_PER_DAY: "",
    });
    // Defaults: 10/min, 200/day.
    for (let i = 0; i < 9; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 1000 * (i + 1)) });
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
    state.fake.seed({ userId: USER, createdAt: new Date(NOW - 500) });
    await expect(assertAiAllowance(USER)).rejects.toMatchObject({ status: 429 });
  });
});

describe("assertAiAllowance — monthly USD cap", () => {
  it("rejects with 402 once the app-wide monthly spend reaches the cap", async () => {
    const { assertAiAllowance, AiBudgetError } = await loadBudget();
    // Spend belongs to another user and is spread across the month: the cap is
    // global, not per user, so it must still block USER.
    state.fake.seed({
      userId: OTHER,
      createdAt: new Date(Date.UTC(2026, 8, 1, 0, 0, 1)),
      costMicros: BigInt(6_000_000),
    });
    state.fake.seed({
      userId: OTHER,
      createdAt: new Date(NOW - 5 * 86_400_000),
      costMicros: BigInt(4_000_000),
    });

    const err = await assertAiAllowance(USER).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AiBudgetError);
    expect((err as InstanceType<typeof AiBudgetError>).status).toBe(402);
  });

  it("allows spend just under the cap", async () => {
    const { assertAiAllowance, monthlySpendUsd } = await loadBudget();
    state.fake.seed({
      userId: OTHER,
      createdAt: new Date(NOW - 1000),
      costMicros: BigInt(9_999_999),
    });
    expect(await monthlySpendUsd()).toBeCloseTo(9.999999, 6);
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
  });

  it("ignores spend from previous months (UTC month boundary)", async () => {
    const { assertAiAllowance, monthlySpendUsd } = await loadBudget();
    state.fake.seed({
      userId: OTHER,
      createdAt: new Date(Date.UTC(2026, 7, 31, 23, 59, 59)),
      costMicros: BigInt(1_000_000_000),
    });
    expect(await monthlySpendUsd()).toBe(0);
    await expect(assertAiAllowance(USER)).resolves.toBeUndefined();
  });

  it("a zero cap blocks every call with 402", async () => {
    const { assertAiAllowance } = await loadBudget({ AI_MONTHLY_SPEND_CAP_USD: "0" });
    await expect(assertAiAllowance(USER)).rejects.toMatchObject({ status: 402 });
  });

  it("checks the rate limit before the spend cap", async () => {
    const { assertAiAllowance } = await loadBudget({ AI_MONTHLY_SPEND_CAP_USD: "0" });
    for (let i = 0; i < 3; i++)
      state.fake.seed({ userId: USER, createdAt: new Date(NOW - 1000 * (i + 1)) });
    await expect(assertAiAllowance(USER)).rejects.toMatchObject({ status: 429 });
  });
});

describe("recordAiUsage", () => {
  it("persists the call with an estimated cost and the mapped tier", async () => {
    const { recordAiUsage } = await loadBudget();
    await recordAiUsage({
      userId: USER,
      feature: "davinci.translate",
      tier: "heavy",
      model: "claude-fable-5-1",
      usage: { inputTokens: 100, outputTokens: 10 },
    });
    expect(state.fake.usage).toHaveLength(1);
    expect(state.fake.usage[0]).toMatchObject({
      userId: USER,
      feature: "davinci.translate",
      tier: "HEAVY",
      model: "claude-fable-5-1",
      inputTokens: 100,
      outputTokens: 10,
      costMicros: BigInt(100 * 15 + 10 * 75),
    });
  });

  it("fires the 80 % and 100 % alerts once per month each", async () => {
    const fetchMock = vi.fn(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);
    const { recordAiUsage } = await loadBudget({
      AI_ALERT_WEBHOOK_URL: "https://hooks.example/ai",
    });

    // 1M input tokens of claude-sonnet-5 = $3. Cap is $10.
    const call = () =>
      recordAiUsage({
        userId: USER,
        feature: "f",
        tier: "everyday",
        model: "claude-sonnet-5",
        usage: { inputTokens: 1_000_000, outputTokens: 0 },
      });

    await call(); // $3
    await call(); // $6
    expect(fetchMock).not.toHaveBeenCalled();
    await call(); // $9 → 80 %
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await call(); // $12 → 100 % (80 % already sent)
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await call(); // $15 → nothing new
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect([...state.fake.alerts].sort()).toEqual(["2026-09:100", "2026-09:80"]);
  });
});

describe("completeForUser — the gate callers actually use", () => {
  const request = { system: "s", prompt: "p" };

  it("returns null and touches nothing when no model is configured", async () => {
    const { completeForUser } = await loadBudget();
    const result = await completeForUser({
      userId: USER,
      feature: "f",
      tier: "everyday",
      request,
    });
    expect(result).toBeNull();
    expect(state.fake.prisma.aiUsageEvent.count).not.toHaveBeenCalled();
    expect(state.fake.usage).toHaveLength(0);
  });

  it("checks the allowance BEFORE calling the model and records after", async () => {
    const complete = vi.fn(async () => ({
      text: "hi",
      usage: { inputTokens: 5, outputTokens: 7 },
    }));
    state.model = {
      name: "anthropic:claude-sonnet-5",
      model: "claude-sonnet-5",
      complete,
    };
    const { completeForUser } = await loadBudget();

    const result = await completeForUser({
      userId: USER,
      feature: "f",
      tier: "everyday",
      request,
    });
    expect(result?.text).toBe("hi");
    expect(complete).toHaveBeenCalledTimes(1);
    expect(state.fake.usage).toHaveLength(1);
    expect(state.fake.usage[0].costMicros).toBe(BigInt(5 * 3 + 7 * 15));

    const countOrder = state.fake.prisma.aiUsageEvent.count.mock.invocationCallOrder[0];
    const completeOrder = complete.mock.invocationCallOrder[0];
    expect(countOrder).toBeLessThan(completeOrder);
  });

  it("never calls the model once a user is rate-limited, no matter how many times they retry", async () => {
    const complete = vi.fn(async () => ({
      text: "hi",
      usage: { inputTokens: 1, outputTokens: 1 },
    }));
    state.model = {
      name: "anthropic:claude-sonnet-5",
      model: "claude-sonnet-5",
      complete,
    };
    const { completeForUser, AiBudgetError } = await loadBudget();
    const run = () =>
      completeForUser({ userId: USER, feature: "f", tier: "everyday", request });

    await run();
    await run();
    await run(); // 3rd call → at the per-minute limit of 3
    expect(complete).toHaveBeenCalledTimes(3);

    for (let i = 0; i < 20; i++) {
      await expect(run()).rejects.toBeInstanceOf(AiBudgetError);
    }
    expect(complete).toHaveBeenCalledTimes(3);
    expect(state.fake.usage).toHaveLength(3);

    // ...and the window slides: a minute later exactly one more call is allowed.
    vi.setSystemTime(NOW + 60_001);
    await expect(run()).resolves.not.toBeNull();
    expect(complete).toHaveBeenCalledTimes(4);
  });

  it("never calls the model once the monthly cap is hit, for any user", async () => {
    const complete = vi.fn(async () => ({
      text: "hi",
      usage: { inputTokens: 1_000_000, outputTokens: 0 }, // $15 on the heavy model
    }));
    state.model = {
      name: "anthropic:claude-fable-5-1",
      model: "claude-fable-5-1",
      complete,
    };
    const { completeForUser } = await loadBudget();

    await completeForUser({ userId: USER, feature: "f", tier: "heavy", request });
    expect(complete).toHaveBeenCalledTimes(1);

    await expect(
      completeForUser({ userId: OTHER, feature: "f", tier: "heavy", request }),
    ).rejects.toMatchObject({ status: 402 });
    await expect(
      completeForUser({ userId: "user-c", feature: "f", tier: "heavy", request }),
    ).rejects.toMatchObject({ status: 402 });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("does not record usage if the model call itself fails", async () => {
    const complete = vi.fn(async () => {
      throw new Error("upstream 500");
    });
    state.model = {
      name: "anthropic:claude-sonnet-5",
      model: "claude-sonnet-5",
      complete,
    };
    const { completeForUser } = await loadBudget();
    await expect(
      completeForUser({ userId: USER, feature: "f", tier: "everyday", request }),
    ).rejects.toThrow("upstream 500");
    expect(state.fake.usage).toHaveLength(0);
  });
});
