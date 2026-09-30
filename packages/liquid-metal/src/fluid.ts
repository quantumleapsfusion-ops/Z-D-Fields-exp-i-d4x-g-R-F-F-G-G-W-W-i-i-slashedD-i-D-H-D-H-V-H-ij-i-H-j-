/**
 * A liquid surface on a grid. The height field obeys the damped wave equation
 *
 *   ∂²h/∂t² = c² ∇²h − γ ∂h/∂t − k (h − target)
 *
 * so the metal ripples outward from any disturbance, sloshes past the shape it is
 * being pulled toward and settles into it, instead of tweening straight there.
 * Distances are in cells, time in seconds. Explicit leapfrog with fixed substeps
 * keeps c·dt below the 2-D CFL limit (1/√2).
 */
export class Fluid {
  readonly cols: number;
  readonly rows: number;
  readonly height: Float32Array;
  readonly velocity: Float32Array;
  readonly target: Float32Array;

  /** Wave speed in cells per second. */
  waveSpeed = 34;
  /** Velocity damping per second; higher is thicker, more viscous metal. */
  damping = 2.6;
  /** Spring pulling the surface toward `target`, per second squared. */
  restoring = 48;
  /** Fixed integration step; a frame is split into as many of these as it needs. */
  readonly dt = 1 / 120;

  private carry = 0;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    const n = cols * rows;
    this.height = new Float32Array(n);
    this.velocity = new Float32Array(n);
    this.target = new Float32Array(n);
  }

  /** Snap the surface to its target with no motion (reduced motion, first frame). */
  settle(): void {
    this.height.set(this.target);
    this.velocity.fill(0);
  }

  /**
   * Push the surface down (or up) with a Gaussian bell centred on a cell position.
   * `radius` is in cells; `strength` is a vertical velocity.
   */
  splash(cx: number, cy: number, radius: number, strength: number): void {
    const { cols, rows, velocity } = this;
    const r2 = radius * radius;
    const x0 = Math.max(0, Math.floor(cx - radius * 2));
    const x1 = Math.min(cols - 1, Math.ceil(cx + radius * 2));
    const y0 = Math.max(0, Math.floor(cy - radius * 2));
    const y1 = Math.min(rows - 1, Math.ceil(cy + radius * 2));
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        velocity[y * cols + x] += strength * Math.exp(-(dx * dx + dy * dy) / r2);
      }
    }
  }

  /** Advance by `elapsed` seconds (clamped so a background tab can't explode on return). */
  step(elapsed: number): void {
    this.carry += Math.min(elapsed, 0.1);
    while (this.carry >= this.dt) {
      this.substep();
      this.carry -= this.dt;
    }
  }

  private substep(): void {
    const { cols, rows, height: h, velocity: v, target, dt } = this;
    const c2 = this.waveSpeed * this.waveSpeed;
    const g = this.damping;
    const k = this.restoring;
    for (let y = 0; y < rows; y += 1) {
      const up = y > 0 ? y - 1 : y;
      const down = y < rows - 1 ? y + 1 : y;
      for (let x = 0; x < cols; x += 1) {
        const i = y * cols + x;
        const left = x > 0 ? i - 1 : i;
        const right = x < cols - 1 ? i + 1 : i;
        const lap = h[left] + h[right] + h[up * cols + x] + h[down * cols + x] - 4 * h[i];
        const a = c2 * lap - g * v[i] - k * (h[i] - target[i]);
        v[i] += a * dt;
      }
    }
    for (let i = 0; i < h.length; i += 1) h[i] += v[i] * dt;
  }

  /** Central-difference slope at a cell, in height per cell. */
  gradient(x: number, y: number, out: [number, number]): [number, number] {
    const { cols, rows, height: h } = this;
    const i = y * cols + x;
    const l = x > 0 ? h[i - 1] : h[i];
    const r = x < cols - 1 ? h[i + 1] : h[i];
    const u = y > 0 ? h[i - cols] : h[i];
    const d = y < rows - 1 ? h[i + cols] : h[i];
    out[0] = (r - l) / 2;
    out[1] = (d - u) / 2;
    return out;
  }
}
