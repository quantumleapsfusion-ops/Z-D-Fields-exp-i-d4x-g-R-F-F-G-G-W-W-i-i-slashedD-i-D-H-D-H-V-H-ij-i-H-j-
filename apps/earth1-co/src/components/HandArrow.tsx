/**
 * Margin arrows and underlines drawn as slightly unsteady strokes. The wobble is a fixed
 * sequence of small offsets (no randomness) so the server and client render identically.
 */
const WOBBLE = [0.6, -0.9, 0.3, 1.1, -0.5, -1.2, 0.8, 0.2, -0.7, 1.0, -0.3, 0.5];

function wobblyPath(points: [number, number][], seed = 0) {
  return points
    .map(([x, y], i) => {
      const w = WOBBLE[(i + seed) % WOBBLE.length] ?? 0;
      const w2 = WOBBLE[(i * 5 + seed + 3) % WOBBLE.length] ?? 0;
      return `${i === 0 ? "M" : "L"}${(x + w).toFixed(1)} ${(y + w2).toFixed(1)}`;
    })
    .join(" ");
}

type Props = { className?: string; variant?: "down-right" | "left" | "curl" };

export function HandArrow({ className = "", variant = "down-right" }: Props) {
  let body: string;
  let head: string;
  if (variant === "left") {
    body = wobblyPath(
      [
        [118, 14],
        [96, 13],
        [72, 16],
        [48, 14],
        [26, 15],
        [8, 14],
      ],
      2,
    );
    head = wobblyPath(
      [
        [20, 6],
        [8, 14],
        [21, 22],
      ],
      5,
    );
  } else if (variant === "curl") {
    body = wobblyPath(
      [
        [8, 8],
        [30, 4],
        [60, 10],
        [84, 26],
        [96, 46],
        [100, 66],
      ],
      1,
    );
    head = wobblyPath(
      [
        [92, 56],
        [100, 68],
        [108, 57],
      ],
      7,
    );
  } else {
    body = wobblyPath(
      [
        [6, 6],
        [28, 12],
        [52, 22],
        [78, 36],
        [104, 52],
        [118, 62],
      ],
      4,
    );
    head = wobblyPath(
      [
        [106, 64],
        [118, 62],
        [114, 50],
      ],
      9,
    );
  }
  return (
    <svg
      viewBox="0 0 124 72"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={body} />
      <path d={head} />
    </svg>
  );
}

export function HandUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path
        d={wobblyPath(
          [
            [2, 5],
            [40, 4],
            [80, 6],
            [120, 4],
            [160, 6],
            [198, 5],
          ],
          6,
        )}
      />
    </svg>
  );
}
