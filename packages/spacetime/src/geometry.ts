/**
 * The spacetime sheet is the y = 0 plane, x across the screen and z into it, seen from a camera
 * above and in front. Shared by the WebGL shader (via uniforms), pointer unprojection and the
 * static SVG fallback so all three agree on where things are.
 */
export type Vec3 = [number, number, number];

/** Polar grid on the sheet: rings every `ringStep` out to `radius`, and `spokes` radial lines. */
export const SHEET = {
  radius: 30,
  innerRadius: 0.3,
  ringStep: 0.6,
  spokes: 72,
  ringSegments: 256,
  spokeStep: 0.15,
};
export const CAMERA = {
  eye: [0, 5, 8] as Vec3,
  target: [0, 0, -3] as Vec3,
  fovY: (50 * Math.PI) / 180,
  fadeNear: 14,
  fadeFar: 34,
};

/** x, z, mass, radius */
export type Well = [number, number, number, number];

/** Rubber-sheet depression: a Lorentzian well per mass. Mirrored in the vertex shader. */
export function wellHeight(x: number, z: number, wells: readonly Well[]) {
  let h = 0;
  for (const [wx, wz, mass, radius] of wells) {
    const r2 = radius * radius;
    const dx = x - wx;
    const dz = z - wz;
    h -= (mass * r2) / (dx * dx + dz * dz + r2);
  }
  return h;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};

function basis() {
  const f = normalize(sub(CAMERA.target, CAMERA.eye));
  const r = normalize(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  return { f, r, u };
}

/** Column-major perspective × view matrix for the camera at the given aspect ratio. */
export function viewProjection(aspect: number): Float32Array {
  const { f, r, u } = basis();
  const e = CAMERA.eye;
  // prettier-ignore
  const view = [
    r[0], u[0], -f[0], 0,
    r[1], u[1], -f[1], 0,
    r[2], u[2], -f[2], 0,
    -dot(r, e), -dot(u, e), dot(f, e), 1,
  ];
  const near = 0.1;
  const far = 100;
  const t = 1 / Math.tan(CAMERA.fovY / 2);
  // prettier-ignore
  const proj = [
    t / aspect, 0, 0, 0,
    0, t, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let row = 0; row < 4; row++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += proj[k * 4 + row] * view[c * 4 + k];
      out[c * 4 + row] = s;
    }
  return out;
}

/** World point → normalised device coordinates, or null when behind the camera. */
export function project(m: Float32Array, p: Vec3): [number, number] | null {
  const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
  const y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
  const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
  if (w <= 0) return null;
  return [x / w, y / w];
}

/** Screen point (NDC) → sheet (x, z), or null when the ray misses the sheet (above horizon). */
export function screenToSheet(
  ndcX: number,
  ndcY: number,
  aspect: number,
): [number, number] | null {
  const { f, r, u } = basis();
  const th = Math.tan(CAMERA.fovY / 2);
  const dir: Vec3 = [0, 1, 2].map(
    (i) => f[i] + r[i] * ndcX * th * aspect + u[i] * ndcY * th,
  ) as Vec3;
  if (dir[1] > -1e-4) return null;
  const t = -CAMERA.eye[1] / dir[1];
  return [CAMERA.eye[0] + dir[0] * t, CAMERA.eye[2] + dir[2] * t];
}

/**
 * Line-list vertices for the polar grid, as (r, θ, kind) per vertex: kind 0 for rings (these fall
 * inward over time) and 1 for spokes. The shader places them around the well centre.
 */
export function polarVertices(): Float32Array {
  const { radius, innerRadius, ringStep, spokes, ringSegments, spokeStep } = SHEET;
  const out: number[] = [];
  const dt = (Math.PI * 2) / ringSegments;
  for (let r = innerRadius; r < radius; r += ringStep)
    for (let i = 0; i < ringSegments; i++) out.push(r, i * dt, 0, r, (i + 1) * dt, 0);
  for (let i = 0; i < spokes; i++) {
    const t = (i / spokes) * Math.PI * 2;
    for (let r = innerRadius; r < radius - 1e-6; r += spokeStep)
      out.push(r, t, 1, Math.min(radius, r + spokeStep), t, 1);
  }
  return new Float32Array(out);
}
