export type SpacetimeTheme = "earth1" | "e1-4";
export type SpacetimePalette = "chalk" | "silver" | "rainbow";

type RGB = readonly [number, number, number];

export type ResolvedTheme = {
  /** Line colours (sRGB 0–1). One entry is a flat colour; several form a gradient. */
  colors: readonly RGB[];
  /** Adds a moving specular sheen to the lines. */
  sheen: boolean;
  /** Peak line intensity over black. Caps worst-case text contrast; see themes.test.ts. */
  brightness: number;
  breath: number;
  breathSpeed: number;
  /** Sheet units per second the grid slides toward the viewer. */
  drift: number;
  rippleSpeed: number;
  pointerMass: number;
  /** Permanent well anchored to the element matching `singularity.selector`. */
  singularity: { selector: string; mass: number; radius: number } | null;
  /** Ripples with the live recording amplitude from `setSpacetimeAmplitude`. */
  voice: boolean;
};

const hex = (value: string): RGB => {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** Same stops as the Ψπ logo's rainbow gradient. */
const LOGO_RAINBOW = [
  "#e8574a",
  "#ef9a3c",
  "#e9d25a",
  "#6cc07a",
  "#4aa6d8",
  "#7a6fd6",
  "#b06cc6",
].map(hex);

export const palettes: Record<
  SpacetimePalette,
  Pick<ResolvedTheme, "colors" | "sheen">
> = {
  chalk: { colors: [hex("#f1ede1")], sheen: false },
  silver: { colors: [hex("#d5d9df")], sheen: true },
  rainbow: { colors: LOGO_RAINBOW, sheen: false },
};

export const SINGULARITY_SELECTOR = "[data-spacetime-singularity]";

export const themes: Record<SpacetimeTheme, Omit<ResolvedTheme, "colors" | "sheen">> = {
  earth1: {
    brightness: 0.2,
    breath: 0.05,
    breathSpeed: 0.22,
    drift: 0.05,
    rippleSpeed: 3,
    pointerMass: 0.9,
    singularity: { selector: SINGULARITY_SELECTOR, mass: 2.2, radius: 1.5 },
    voice: false,
  },
  "e1-4": {
    brightness: 0.2,
    breath: 0.08,
    breathSpeed: 0.4,
    drift: 0.12,
    rippleSpeed: 4.5,
    pointerMass: 1.3,
    singularity: null,
    voice: true,
  },
};

export function resolveTheme(
  theme: SpacetimeTheme,
  palette: SpacetimePalette = "chalk",
): ResolvedTheme {
  const colors =
    theme === "earth1" ? { colors: [hex("#ffffff")], sheen: false } : palettes[palette];
  return { ...themes[theme], ...colors };
}
