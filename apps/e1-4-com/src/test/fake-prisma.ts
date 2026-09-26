import { vi } from "vitest";

type UsageRow = {
  userId: string;
  feature: string;
  tier: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costMicros: bigint;
  createdAt: Date;
};

type DateFilter = { gte?: Date };
type UsageWhere = { userId?: string; createdAt?: DateFilter };

function matches(row: UsageRow, where: UsageWhere | undefined): boolean {
  if (!where) return true;
  if (where.userId !== undefined && row.userId !== where.userId) return false;
  if (where.createdAt?.gte && row.createdAt < where.createdAt.gte) return false;
  return true;
}

/**
 * Minimal in-memory stand-in for the Prisma models `budget.ts` touches. Mirrors
 * the real query semantics closely enough to test the enforcement logic
 * (per-user rolling windows, global monthly sum, unique alert rows).
 */
export function createFakePrisma(now: () => number = Date.now) {
  const usage: UsageRow[] = [];
  const alerts = new Set<string>();

  const prisma = {
    aiUsageEvent: {
      count: vi.fn(
        async ({ where }: { where?: UsageWhere }) =>
          usage.filter((r) => matches(r, where)).length,
      ),
      aggregate: vi.fn(
        async ({ where }: { _sum: { costMicros: true }; where?: UsageWhere }) => {
          const rows = usage.filter((r) => matches(r, where));
          const sum = rows.reduce((acc, r) => acc + r.costMicros, BigInt(0));
          return { _sum: { costMicros: rows.length ? sum : null } };
        },
      ),
      create: vi.fn(async ({ data }: { data: Omit<UsageRow, "createdAt"> }) => {
        const row = { ...data, createdAt: new Date(now()) };
        usage.push(row);
        return row;
      }),
    },
    aiBudgetAlert: {
      create: vi.fn(
        async ({ data }: { data: { month: string; thresholdPercent: number } }) => {
          const key = `${data.month}:${data.thresholdPercent}`;
          if (alerts.has(key)) throw new Error("Unique constraint failed");
          alerts.add(key);
          return data;
        },
      ),
    },
  };

  /** Seed a usage row directly (bypassing `recordAiUsage`). */
  function seed(row: Partial<UsageRow> & { userId: string; createdAt: Date }) {
    usage.push({
      feature: "test",
      tier: "EVERYDAY",
      model: "claude-sonnet-5",
      inputTokens: 0,
      outputTokens: 0,
      costMicros: BigInt(0),
      ...row,
    });
  }

  return { prisma, usage, alerts, seed };
}

export type FakePrisma = ReturnType<typeof createFakePrisma>;
