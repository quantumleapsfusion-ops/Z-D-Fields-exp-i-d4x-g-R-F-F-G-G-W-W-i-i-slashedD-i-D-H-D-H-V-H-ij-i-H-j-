export type SpacetimeTheme = "earth1" | "e1-4";
export type SpacetimePalette = "cosmos" | "chalk" | "silver" | "rainbow";

export type RGB = readonly [number, number, number];

export type ResolvedTheme = {
  /** Line colours (sRGB 0–1). One entry is a flat colour; several form a gradient. */
  colors: readonly RGB[];
  /** Adds a moving specular sheen to the lines. */
  sheen: boolean;
  /** Scale applied to `colors`. Keeps line luminance within `LINE_MAX_LUMINANCE`. */
  brightness: number;
  /** Deep-space backdrop: vertical gradient plus two faint nebula glows. */
  sky: { top: RGB; bottom: RGB; glowA: RGB; glowB: RGB };
  /** Fraction of 28px cells that hold a star. */
  stars: number;
  breath: number;
  breathSpeed: number;
  /** Sheet units per second the rings fall toward the centre of the well. */
  drift: number;
  /** Radians per second the spokes turn. */
  spin: number;
  rippleSpeed: number;
  pointerMass: number;
  /**
   * Permanent well anchored to the element matching `selector`, which also gets rainbow light
   * rays and orbit rings drawn around it.
   */
  singularity: { selector: string; mass: number; radius: number } | null;
  /** Ripples with the live recording amplitude from `setSpacetimeAmplitude`. */
  voice: boolean;
};

/**
 * Relative-luminance ceilings. Sky and lines combine with a per-channel max, so the brightest
 * possible pixel behind text is at most their sum; themes.test.ts holds that sum to 4.5:1 against
 * every brand text colour. The singularity's glow is exempt within ~2 logo radii, where no text
 * sits.
 */
export const SKY_MAX_LUMINANCE = 0.014;
export const LINE_MAX_LUMINANCE = 0.021;

const hex = (value: string): RGB => {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** Same stops as the Ψπ logo's rainbow gradient. */
export const LOGO_RAINBOW = [
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
  Pick<ResolvedTheme, "colors" | "sheen" | "brightness">
> = {
  cosmos: { colors: [hex("#6f93c8")], sheen: false, brightness: 0.27 },
  chalk: { colors: [hex("#f1ede1")], sheen: false, brightness: 0.16 },
  silver: { colors: [hex("#d5d9df")], sheen: true, brightness: 0.17 },
  rainbow: { colors: LOGO_RAINBOW, sheen: false, brightness: 0.19 },
};

const SKY: ResolvedTheme["sky"] = {
  top: hex("#0b0e2c"),
  bottom: hex("#06081a"),
  glowA: [0.06, 0.03, 0.13],
  glowB: [0.07, 0.03, 0.03],
};

export const SINGULARITY_SELECTOR = "[data-spacetime-singularity]";

type Motion = Omit<ResolvedTheme, "colors" | "sheen" | "brightness" | "sky">;

export const themes: Record<SpacetimeTheme, Motion> = {
  earth1: {
    stars: 0.09,
    breath: 0.04,
    breathSpeed: 0.2,
    drift: 0.06,
    spin: 0.004,
    rippleSpeed: 3,
    pointerMass: 0.9,
    singularity: { selector: SINGULARITY_SELECTOR, mass: 3, radius: 0.9 },
    voice: false,
  },
  "e1-4": {
    stars: 0.07,
    breath: 0.07,
    breathSpeed: 0.4,
    drift: 0.12,
    spin: 0.008,
    rippleSpeed: 4.5,
    pointerMass: 1.3,
    singularity: null,
    voice: true,
  },
};

export function resolveTheme(
  theme: SpacetimeTheme,
  palette: SpacetimePalette = "cosmos",
): ResolvedTheme {
  const lines = theme === "earth1" ? palettes.cosmos : palettes[palette];
  return { ...themes[theme], ...lines, sky: SKY };
}
