export type {
  FieldSection,
  FieldSlug,
  Figure,
  Quote,
  Topic,
  TopicEquation,
} from "./types";
export { citableQuotes, lifespan } from "./quotes";
export { globalCitizenship } from "./citizenship";
export { globalPhilanthropy } from "./philanthropy";
export { biochemistry } from "./biochemistry";
export { biology, chemistry, mathematics, physics } from "./sciences";

import { globalCitizenship } from "./citizenship";
import { globalPhilanthropy } from "./philanthropy";
import { biochemistry } from "./biochemistry";
import { biology, chemistry, mathematics, physics } from "./sciences";
import type { FieldSection } from "./types";

/** Every content-backed section, keyed by its URL slug. */
export const sections: readonly FieldSection[] = [
  physics,
  chemistry,
  biology,
  biochemistry,
  mathematics,
  globalCitizenship,
  globalPhilanthropy,
];
export const sectionBySlug: ReadonlyMap<string, FieldSection> = new Map(
  sections.map((s) => [s.slug, s]),
);
