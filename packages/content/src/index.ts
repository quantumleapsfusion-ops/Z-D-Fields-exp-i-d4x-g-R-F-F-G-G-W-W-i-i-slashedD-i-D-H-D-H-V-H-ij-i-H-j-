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
export { biochemistry } from "./biochemistry";
export { mathematics } from "./mathematics";
export { philanthropy } from "./philanthropy";
export { biology, chemistry, physics } from "./sciences";

import { globalCitizenship } from "./citizenship";
import { biochemistry } from "./biochemistry";
import { mathematics } from "./mathematics";
import { philanthropy } from "./philanthropy";
import { biology, chemistry, physics } from "./sciences";
import type { FieldSection } from "./types";

/** Every content-backed section, keyed by its URL slug. */
export const sections: readonly FieldSection[] = [
  physics,
  chemistry,
  biology,
  biochemistry,
  mathematics,
  philanthropy,
  globalCitizenship,
];
export const sectionBySlug: ReadonlyMap<string, FieldSection> = new Map(
  sections.map((s) => [s.slug, s]),
);
