/** Sun's gravitational parameter (G·M) in scene units: a body at r = 1 circles in 12 s. */
export const GM = ((2 * Math.PI) / 12) ** 2;

export type Body = { x: number; y: number; vx: number; vy: number };

/** Speed of a circular orbit at radius `r`. */
export function circularSpeed(r: number): number {
  return Math.sqrt(GM / r);
}

/** A body at radius `r` and angle `theta`, moving counter-clockwise at `boost` × circular speed. */
export function orbiting(r: number, theta: number, boost = 1): Body {
  const v = circularSpeed(r) * boost;
  return {
    x: Math.cos(theta) * r,
    y: Math.sin(theta) * r,
    vx: -Math.sin(theta) * v,
    vy: Math.cos(theta) * v,
  };
}

function pull(b: Body) {
  const r2 = b.x * b.x + b.y * b.y;
  const r = Math.sqrt(r2);
  const a = -GM / (r2 * r);
  return { ax: a * b.x, ay: a * b.y };
}

/** One velocity-Verlet step under the Sun's inverse-square pull. Energy stays bounded, so orbits close. */
export function step(b: Body, dt: number): void {
  const a0 = pull(b);
  b.x += b.vx * dt + 0.5 * a0.ax * dt * dt;
  b.y += b.vy * dt + 0.5 * a0.ay * dt * dt;
  const a1 = pull(b);
  b.vx += 0.5 * (a0.ax + a1.ax) * dt;
  b.vy += 0.5 * (a0.ay + a1.ay) * dt;
}

/** Specific orbital energy; negative means the body is bound to the Sun. */
export function energy(b: Body): number {
  return 0.5 * (b.vx * b.vx + b.vy * b.vy) - GM / Math.hypot(b.x, b.y);
}
