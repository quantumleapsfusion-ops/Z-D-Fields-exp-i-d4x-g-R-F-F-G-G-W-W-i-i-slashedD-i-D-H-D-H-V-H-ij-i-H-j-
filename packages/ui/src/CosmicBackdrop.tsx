const W = 1600;
const H = 1000;
const CX = 800;
const CY = 470;
const TILT = 0.32;
const RINGS = [70, 115, 175, 255, 355, 480, 640, 840, 1090, 1400];
const SPOKES = 28;

/** Gravity-well sag: inner rings sit lower, so the grid reads as a funnel. */
const dip = (r: number) => 110 * Math.exp(-r / 170);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(14);
const STARS = Array.from({ length: 170 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 0.45 + rand() ** 3 * 1.7,
  o: 0.25 + rand() * 0.7,
}));

const spokes = Array.from({ length: SPOKES }, (_, i) => {
  const a = (i / SPOKES) * Math.PI * 2;
  const inner = RINGS[0];
  const outer = 2400;
  return {
    x1: CX + inner * Math.cos(a),
    y1: CY + dip(inner) + inner * TILT * Math.sin(a),
    x2: CX + outer * Math.cos(a),
    y2: CY + outer * TILT * Math.sin(a),
  };
});

/**
 * Full-viewport deep-space backdrop: nebula glow, a perspective gravity-well grid and a
 * deterministic starfield. Render once per page, behind all content.
 */
export function CosmicBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        backgroundColor: "var(--color-blackboard)",
        backgroundImage: [
          "radial-gradient(ellipse 60% 50% at 88% 6%, rgb(58 38 130 / 0.55), transparent 70%)",
          "radial-gradient(ellipse 45% 40% at 30% 48%, rgb(20 90 140 / 0.35), transparent 70%)",
          "radial-gradient(ellipse 50% 40% at 0% 100%, rgb(90 45 40 / 0.35), transparent 70%)",
        ].join(","),
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="rgb(130 165 225)" strokeOpacity="0.2" strokeWidth="1">
          {RINGS.map((r) => (
            <ellipse key={r} cx={CX} cy={CY + dip(r)} rx={r} ry={r * TILT} />
          ))}
          {spokes.map((s, i) => (
            <line key={i} {...s} strokeOpacity="0.14" />
          ))}
        </g>
        <g fill="#fff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
