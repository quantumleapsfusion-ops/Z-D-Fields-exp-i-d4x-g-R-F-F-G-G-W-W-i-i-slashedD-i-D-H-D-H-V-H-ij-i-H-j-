import type { Fluid } from "./fluid";

/** Radians per second the voice's ripples circle the centre. */
const VOICE_ORBIT = 1.7;

/**
 * A voice keeps the pool moving in proportion to its loudness: two drops on opposite sides of a
 * circle that turns with time and widens as the voice gets louder, so speech stirs the metal
 * into a slow whirl instead of random noise.
 */
export function voiceRipples(
  fluid: Fluid,
  now: number,
  level: number,
  cellsPerDefault: number,
) {
  const angle = now * VOICE_ORBIT;
  const reach = 0.1 + Math.min(1, level) * 0.22;
  for (const side of [0, Math.PI]) {
    fluid.splash(
      (fluid.cols - 1) / 2 + Math.cos(angle + side) * fluid.cols * reach,
      (fluid.rows - 1) / 2 + Math.sin(angle + side) * fluid.rows * reach,
      3 * cellsPerDefault,
      -level * 4.5,
    );
  }
}
