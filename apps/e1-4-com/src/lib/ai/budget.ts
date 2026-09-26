import "server-only";

import type { AiTier } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getLanguageModel } from "@/lib/llm";
import type { Completion, CompletionRequest, ModelTier, TokenUsage } from "@/lib/llm";

const MICROS = BigInt(1_000_000);

/**
 * List price per 1M tokens in USD (input, output). Estimates — override with
 * `AI_MODEL_PRICES_JSON='{"claude-sonnet-5":[3,15]}'` to match your invoice.
 */
const DEFAULT_PRICES: Record<string, [number, number]> = {
  "claude-haiku-4-5": [1, 5],
  "claude-sonnet-5": [3, 15],
  "claude-fable-5-1": [15, 75],
  "gpt-4o": [2.5, 10],
};

function priceTable(): Record<string, [number, number]> {
  const raw = process.env.AI_MODEL_PRICES_JSON;
  if (!raw) return DEFAULT_PRICES;
  try {
    return {
      ...DEFAULT_PRICES,
      ...(JSON.parse(raw) as Record<string, [number, number]>),
    };
  } catch {
    return DEFAULT_PRICES;
  }
}

/** Cost of one call in micro-dollars. Unknown models are priced like the heavy tier. */
export function estimateCostMicros(model: string, usage: TokenUsage): bigint {
  const [inPer1M, outPer1M] = priceTable()[model] ?? DEFAULT_PRICES["claude-fable-5-1"];
  // tokens × (USD per 1M tokens) is already micro-dollars.
  return BigInt(Math.round(usage.inputTokens * inPer1M + usage.outputTokens * outPer1M));
}

export function currentMonthKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export class AiBudgetError extends Error {
  constructor(
    readonly status: 402 | 429,
    message: string,
  ) {
    super(message);
    this.name = "AiBudgetError";
  }
}

/** Sum of estimated spend for the current UTC month, in USD. */
export async function monthlySpendUsd(now = new Date()): Promise<number> {
  const agg = await prisma.aiUsageEvent.aggregate({
    _sum: { costMicros: true },
    where: { createdAt: { gte: monthStart(now) } },
  });
  return Number(agg._sum.costMicros ?? BigInt(0)) / Number(MICROS);
}

/**
 * Throws `AiBudgetError` when the user is over their rate limit (429) or the
 * whole app has reached the monthly spend cap (402). Call before hitting a model.
 */
export async function assertAiAllowance(userId: string): Promise<void> {
  const { perUserPerMinute, perUserPerDay, monthlyCapUsd } = env.aiBudget;
  const now = Date.now();

  const [lastMinute, lastDay, spent] = await Promise.all([
    prisma.aiUsageEvent.count({
      where: { userId, createdAt: { gte: new Date(now - 60_000) } },
    }),
    prisma.aiUsageEvent.count({
      where: { userId, createdAt: { gte: new Date(now - 86_400_000) } },
    }),
    monthlySpendUsd(),
  ]);

  if (lastMinute >= perUserPerMinute) {
    throw new AiBudgetError(429, "Too many requests — wait a minute and try again.");
  }
  if (lastDay >= perUserPerDay) {
    throw new AiBudgetError(429, "Daily AI limit reached — try again tomorrow.");
  }
  if (spent >= monthlyCapUsd) {
    throw new AiBudgetError(402, "This month's AI budget is used up.");
  }
}

const ALERT_THRESHOLDS = [80, 100] as const;

async function sendAlert(text: string): Promise<void> {
  const { alertWebhookUrl, alertEmailTo, resendApiKey, alertEmailFrom } = env.aiBudget;
  const jobs: Promise<unknown>[] = [];

  if (alertWebhookUrl) {
    jobs.push(
      fetch(alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, content: text }),
      }),
    );
  }
  if (alertEmailTo && resendApiKey) {
    jobs.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: alertEmailFrom,
          to: [alertEmailTo],
          subject: "e1-4 AI spend alert",
          text,
        }),
      }),
    );
  }
  if (jobs.length === 0) {
    console.warn(
      `[ai-budget] ${text} (no AI_ALERT_WEBHOOK_URL / AI_ALERT_EMAIL_TO configured)`,
    );
    return;
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected")
      console.error("[ai-budget] alert delivery failed", r.reason);
  }
}

/** Sends the 80 % / 100 % alerts once per month each. */
async function maybeAlert(spentUsd: number): Promise<void> {
  const { monthlyCapUsd } = env.aiBudget;
  if (monthlyCapUsd <= 0) return;
  const percent = (spentUsd / monthlyCapUsd) * 100;
  const month = currentMonthKey();

  for (const threshold of ALERT_THRESHOLDS) {
    if (percent < threshold) continue;
    try {
      await prisma.aiBudgetAlert.create({ data: { month, thresholdPercent: threshold } });
    } catch {
      continue; // already sent this month
    }
    await sendAlert(
      `e1-4 AI spend is at ${percent.toFixed(0)} % of the $${monthlyCapUsd} monthly cap ` +
        `($${spentUsd.toFixed(2)} so far in ${month}).` +
        (threshold === 100 ? " Further model calls are blocked until next month." : ""),
    );
  }
}

export type UsageInput = {
  userId: string;
  feature: string;
  tier: ModelTier;
  model: string;
  usage: TokenUsage;
};

/** Records one model call and fires spend alerts if a threshold was crossed. */
export async function recordAiUsage(input: UsageInput): Promise<void> {
  const tier: AiTier = input.tier === "heavy" ? "HEAVY" : "EVERYDAY";
  await prisma.aiUsageEvent.create({
    data: {
      userId: input.userId,
      feature: input.feature,
      tier,
      model: input.model,
      inputTokens: input.usage.inputTokens,
      outputTokens: input.usage.outputTokens,
      costMicros: estimateCostMicros(input.model, input.usage),
    },
  });
  await maybeAlert(await monthlySpendUsd());
}

/**
 * Rate-limit → complete → record, in one call. Returns `null` when no model is
 * configured (callers already render a stub for that case).
 */
export async function completeForUser(input: {
  userId: string;
  feature: string;
  tier: ModelTier;
  request: CompletionRequest;
}): Promise<Completion | null> {
  const model = getLanguageModel(input.tier);
  if (!model) return null;
  await assertAiAllowance(input.userId);
  const completion = await model.complete(input.request);
  await recordAiUsage({
    userId: input.userId,
    feature: input.feature,
    tier: input.tier,
    model: model.model,
    usage: completion.usage,
  });
  return completion;
}
