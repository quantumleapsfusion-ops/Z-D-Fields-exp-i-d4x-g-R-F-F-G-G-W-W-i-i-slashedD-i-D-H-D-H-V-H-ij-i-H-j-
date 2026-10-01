export type { FieldSection, FieldSlug, Figure, Quote } from "./types";
export { citableQuotes, lifespan } from "./quotes";
export { biology, chemistry, mathematics, physics } from "./sciences";

import { biology, chemistry, mathematics, physics } from "./sciences";
import type { FieldSection } from "./types";

/** Every content-backed section, keyed by its URL slug. */
export const sections: readonly FieldSection[] = [
  physics,
  chemistry,
  biology,
  mathematics,
];
export const sectionBySlug: ReadonlyMap<string, FieldSection> = new Map(
  sections.map((s) => [s.slug, s]),
);
