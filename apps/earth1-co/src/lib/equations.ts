/**
 * Equations shown on earth1.co. `tex` uses a tiny subset of TeX: `_{…}` for subscripts and
 * `^{…}` for superscripts; everything else is rendered verbatim in Plex Mono.
 */
export type Equation = {
  id: string;
  name: string;
  tex: string;
  caption: string;
};

export const equations: Equation[] = [
  {
    id: "schrodinger",
    name: "Schrödinger",
    tex: "iħ ∂Ψ/∂t = ĤΨ",
    caption: "A wavefunction doesn't carry a passport.",
  },
  {
    id: "einstein-field",
    name: "Einstein field equations",
    tex: "G_{μν} + Λg_{μν} = (8πG/c^{4}) T_{μν}",
    caption: "Spacetime curves the same way on every side of every border.",
  },
];

export type EquationToken =
  | { kind: "text"; value: string }
  | { kind: "sub"; value: string }
  | { kind: "sup"; value: string };

export function tokenizeEquation(tex: string): EquationToken[] {
  const tokens: EquationToken[] = [];
  const re = /([_^])\{([^}]*)\}/g;
  let last = 0;
  for (const match of tex.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ kind: "text", value: tex.slice(last, index) });
    tokens.push({ kind: match[1] === "_" ? "sub" : "sup", value: match[2] });
    last = index + match[0].length;
  }
  if (last < tex.length) tokens.push({ kind: "text", value: tex.slice(last) });
  return tokens;
}
