/**
 * Feature flags. `NEXT_PUBLIC_*` values are inlined at build time so both server and client
 * components agree. Surface flags default on.
 */
function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

export const flags = {
  gravityChalkboard: flag(process.env.NEXT_PUBLIC_FEATURE_GRAVITY_CHALKBOARD, true),
  eventHorizon: flag(process.env.NEXT_PUBLIC_FEATURE_EVENT_HORIZON, true),
  superposition: flag(process.env.NEXT_PUBLIC_FEATURE_SUPERPOSITION, true),
  daVinci: flag(process.env.NEXT_PUBLIC_FEATURE_DA_VINCI, false),
} as const;
