/**
 * A quotation. `verified: true` means we checked the wording against the named source
 * (book, letter, paper, recorded speech). Anything else is kept for the record but is
 * never rendered: see `citableQuotes`.
 */
export type Quote = {
  text: string;
  /** Work, chapter or section, and year. Empty when we could not find one. */
  source: string;
  verified: boolean;
  /** Translation or wording caveats, shown under the quote. */
  caveat?: string;
};

export type Figure = {
  slug: string;
  name: string;
  /** Year as written, e.g. "1642" or "c. 354". */
  born: string;
  /** Empty string for the living. */
  died: string;
  field: string[];
  contributions: string[];
  quotes: Quote[];
};

export type FieldSlug =
  "chemistry" | "physics" | "biology" | "biochemistry" | "mathematics";

/** A displayed equation. `tex` is KaTeX source; `label` is what a screen reader hears. */
export type TopicEquation = {
  tex: string;
  label: string;
  /** One sentence on what the symbols mean. */
  note?: string;
};

/** A subject section of a field page: a few paragraphs and the equations they lean on. */
export type Topic = {
  id: string;
  title: string;
  paragraphs: string[];
  equations?: TopicEquation[];
};

export type FieldSection = {
  slug: FieldSlug | "global-citizenship" | "philanthropy";
  title: string;
  /** One line under the title; also the meta description lead. */
  line: string;
  intro: string[];
  /** The subject itself, before the people. */
  topics?: Topic[];
  figures: Figure[];
  /** Optional sub-section, e.g. science fiction under global citizenship. */
  sub?: { id: string; title: string; intro: string[]; figures: Figure[] };
};
