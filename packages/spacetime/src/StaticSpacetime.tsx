import { SHEET, project, screenToSheet, viewProjection, wellHeight } from "./geometry";
import type { Well } from "./geometry";
import type { ResolvedTheme } from "./themes";

const WIDTH = 1600;
const HEIGHT = 1000;

/** Static frame of the sheet for browsers without WebGL and for reduced-motion users. */
export function StaticSpacetime({ theme }: { theme: ResolvedTheme }) {
  const aspect = WIDTH / HEIGHT;
  const m = viewProjection(aspect);
  const { singularity } = theme;
  const centre = singularity ? screenToSheet(0, 0.35, aspect) : null;
  const wells: Well[] =
    singularity && centre
      ? [[centre[0], centre[1], singularity.mass, singularity.radius]]
      : [];
  const step = 0.25;
  const spacing = SHEET.spacing * 2;

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

  const paths: string[] = [];
  for (let z = SHEET.far; z <= SHEET.near; z += spacing) {
    const pts: [number, number][] = [];
    for (let x = -SHEET.halfWidth; x <= SHEET.halfWidth; x += step) pts.push([x, z]);
    paths.push(toPath(pts));
  }
  for (let x = -SHEET.halfWidth; x <= SHEET.halfWidth; x += spacing) {
    const pts: [number, number][] = [];
    for (let z = SHEET.far; z <= SHEET.near; z += step) pts.push([x, z]);
    paths.push(toPath(pts));
  }

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
        <linearGradient id="spacetime-lines" x1="0" x2="1" y1="0" y2="0">
          {theme.colors.map((c, i) => (
            <stop
              key={i}
              offset={i / Math.max(1, theme.colors.length - 1)}
              stopColor={rgb(c, theme.brightness)}
            />
          ))}
        </linearGradient>
        <linearGradient id="spacetime-depth" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="1" />
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="#000" />
      <g fill="none" stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <rect width={WIDTH} height={HEIGHT} fill="url(#spacetime-depth)" />
    </svg>
  );
}

/** Colour pre-multiplied onto black, so overlapping strokes never get brighter. */
function rgb([r, g, b]: readonly [number, number, number], k: number) {
  const c = (v: number) => Math.round(v * k * 255);
  return `rgb(${c(r)} ${c(g)} ${c(b)})`;
}
