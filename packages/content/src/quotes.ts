import type { Figure, Quote } from "./types";

/** The only quotes a page may render: verified, with a non-empty source. */
export function citableQuotes(quotes: readonly Quote[]): Quote[] {
  return quotes.filter((q) => q.verified && q.source.trim().length > 0);
}

/** Lifespan for display: "1642 – 1727", or "born 1936" for the living. */
export function lifespan(f: Pick<Figure, "born" | "died">): string {
  return f.died ? `${f.born} – ${f.died}` : `born ${f.born}`;
}
