export type SectionSlug = "quantum-mechanics" | "quantum-computing" | "physics";

/** A quotation we have checked against a primary source. Anything we could not source stays out, or goes in `notes`. */
export type Quote = {
  text: string;
  /** Book, letter, lecture or paper, with year. */
  source: string;
  /** Translation or wording caveats. */
  caveat?: string;
  /** Checked against `source`. Unverified quotes are never rendered. */
  verified: boolean;
};

export type Person = {
  slug: string;
  name: string;
  /** "1858 Kiel – 1947 Göttingen" or, for several people, a short line for each. */
  lived: string;
  country: string;
  /** One line: what this person is known for. */
  known: string;
  sections: SectionSlug[];
  who: string;
  work: string[];
  mattered: string[];
  quotes?: Quote[];
  /** Misattributions, unsourced sayings and other honest footnotes. */
  notes?: string[];
  /** Equation ids from `equations.ts`. */
  equations?: string[];
  /** Plain-language ideas this person is tied to. */
  ideas?: string[];
  related?: string[];
};

export type Equation = {
  id: string;
  name: string;
  /** Plain Unicode so it reads everywhere without a maths renderer. */
  formula: string;
  /** LaTeX for KaTeX rendering; `formula` stays the accessible text. */
  tex?: string;
  year: string;
  explain: string;
  /** What each symbol means. */
  symbols?: string;
  people: string[];
  sections: SectionSlug[];
};
