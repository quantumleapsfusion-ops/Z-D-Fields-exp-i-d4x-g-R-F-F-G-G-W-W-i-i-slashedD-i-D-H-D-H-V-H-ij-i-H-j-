/**
 * Feature flags. `NEXT_PUBLIC_*` values are inlined at build time so both server and client
 * components agree. Experimental surfaces default OFF.
 */
function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const flags = {
  /** Gravity Board — experimental prototype; launch inclusion undecided. */
  gravityBoard: flag(process.env.NEXT_PUBLIC_FEATURE_GRAVITY_BOARD, false),
  /** Infinity Chalkboard 3D view — experimental Three.js renderer. */
  chalkboard3d: flag(process.env.NEXT_PUBLIC_FEATURE_CHALKBOARD_3D, false),
  /** Infinity Chalkboard 4D view — placeholder only; nothing renders yet. */
  chalkboard4d: flag(process.env.NEXT_PUBLIC_FEATURE_CHALKBOARD_4D, false),
} as const;
