import { SHEET, project, screenToSheet, viewProjection, wellHeight } from "./geometry";
import type { Well } from "./geometry";
import { LOGO_RAINBOW, type RGB, type ResolvedTheme } from "./themes";

const WIDTH = 1600;
const HEIGHT = 1000;
/** Where the singularity sits in the still frame (NDC y), roughly behind a hero logo. */
const SINGULARITY_NDC_Y = 0.35;

/** Deterministic star field so server and client renders agree. */
function stars(fraction: number) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const out: [number, number, number][] = [];
  const count = Math.round(((WIDTH * HEIGHT) / (28 * 28)) * fraction);
  for (let i = 0; i < count; i++)
    out.push([rand() * WIDTH, rand() * HEIGHT, 0.5 + rand()]);
  return out;
}

/** Static frame of the sheet for browsers without WebGL and for reduced-motion users. */
export function StaticSpacetime({ theme }: { theme: ResolvedTheme }) {
  const aspect = WIDTH / HEIGHT;
  const m = viewProjection(aspect);
  const { singularity, sky } = theme;
  const centre =
    screenToSheet(0, singularity ? SINGULARITY_NDC_Y : 0, aspect) ?? ([0, -3] as const);
  const wells: Well[] = singularity
    ? [[centre[0], centre[1], singularity.mass, singularity.radius]]
    : [];

  const toPath = (points: [number, number][]) => {
    let d = "";
    for (const [x, z] of points) {
      const p = project(m, [x, wellHeight(x, z, wells), z]);
      if (!p) continue;
      const sx = Math.round(((p[0] + 1) / 2) * WIDTH);
      const sy = Math.round(((1 - p[1]) / 2) * HEIGHT);
      d += `${d ? "L" : "M"}${sx} ${sy}`;
    }
    return d;
  };
  const at = (r: number, t: number): [number, number] => [
    centre[0] + r * Math.cos(t),
    centre[1] + r * Math.sin(t),
  ];

  const paths: string[] = [];
  const reach = SHEET.radius * 0.8;
  for (let r = SHEET.innerRadius + 0.3; r < reach; r += SHEET.ringStep * 2) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 128; i++) pts.push(at(r, (i / 128) * Math.PI * 2));
    paths.push(toPath(pts));
  }
  for (let i = 0; i < SHEET.spokes / 2; i++) {
    const t = (i / (SHEET.spokes / 2)) * Math.PI * 2;
    const pts: [number, number][] = [];
    for (let r = SHEET.innerRadius + 0.3; r < reach; r += 0.3) pts.push(at(r, t));
    paths.push(toPath(pts));
  }

  const logo = project(m, [centre[0], 0, centre[1]]);
  const logoPx = logo && [((logo[0] + 1) / 2) * WIDTH, ((1 - logo[1]) / 2) * HEIGHT];

  const stroke =
    theme.colors.length > 1
      ? "url(#spacetime-lines)"
      : rgb(theme.colors[0], theme.brightness);
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="spacetime-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={rgb(sky.top)} />
          <stop offset="1" stopColor={rgb(sky.bottom)} />
        </linearGradient>
        <radialGradient id="spacetime-glow-a" cx="0.85" cy="0.1" r="0.7">
          <stop offset="0" stopColor={rgb(sky.glowA)} />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <radialGradient id="spacetime-glow-b" cx="0.05" cy="0.95" r="0.6">
          <stop offset="0" stopColor={rgb(sky.glowB)} />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <linearGradient id="spacetime-lines" x1="0" x2="1" y1="0" y2="0">
          {theme.colors.map((c, i) => (
            <stop
              key={i}
              offset={i / Math.max(1, theme.colors.length - 1)}
              stopColor={rgb(c, theme.brightness)}
            />
          ))}
        </linearGradient>
        <linearGradient id="spacetime-horizon" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={rgb(sky.top)} stopOpacity="1" />
          <stop offset="0.4" stopColor={rgb(sky.top)} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#spacetime-sky)" />
      <g style={{ mixBlendMode: "screen" }}>
        <rect width={WIDTH} height={HEIGHT} fill="url(#spacetime-glow-a)" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#spacetime-glow-b)" />
      </g>
      <g fill="#1c1f34">
        {stars(theme.stars).map(([x, y, r], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} />
        ))}
      </g>
      <g fill="none" stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <rect width={WIDTH} height={HEIGHT} fill="url(#spacetime-horizon)" />
      {singularity && logoPx && (
        <g strokeLinecap="round" style={{ mixBlendMode: "screen" }}>
          {LOGO_RAINBOW.map((c, i) => {
            const a = i * 0.8976 + 0.35;
            const [x, y] = logoPx;
            return (
              <line
                key={i}
                x1={(x + Math.cos(a) * 80).toFixed(1)}
                y1={(y + Math.sin(a) * 80).toFixed(1)}
                x2={(x + Math.cos(a) * 420).toFixed(1)}
                y2={(y + Math.sin(a) * 420).toFixed(1)}
                stroke={rgb(c, 0.22)}
                strokeWidth={2}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}

/** Colour scaled toward black, so overlapping strokes never get brighter. */
function rgb([r, g, b]: RGB, k = 1) {
  const c = (v: number) => Math.round(v * k * 255);
  return `rgb(${c(r)} ${c(g)} ${c(b)})`;
}
