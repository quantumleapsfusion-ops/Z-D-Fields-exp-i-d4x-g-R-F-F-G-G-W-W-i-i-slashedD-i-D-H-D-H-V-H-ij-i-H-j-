/**
 * e1-4 3D: the Gravity Board.
 *
 * A stream of speech is heard as a superposition of readings; the one with the most weight falls
 * into a shape. The working code is in `apps/e1-4-com/src/lib/gravity` and
 * `src/features/gravity`; this package names the contract. No code runs here.
 */

/** The shapes a reading can collapse into. */
export const FORMS = ["sphere", "torus", "knot", "spiral", "wave", "lattice"] as const;
export type Form = (typeof FORMS)[number];

/** One way of hearing what was said. */
export interface Candidate {
  title: string;
  interpretation: string;
  form: Form;
  /** 0 to 1. Candidates are compared, not summed. */
  confidence: number;
}

/** Every reading at once, and which one the board has settled on. */
export interface Superposition {
  candidates: Candidate[];
  /** `llm` when Da Vinci produced the readings; `stub` when it was unreachable. */
  source: "llm" | "stub";
  resolvedIndex: number;
}

/** Produces readings from text. Da Vinci implements it; the board only asks. */
export interface Superposer {
  superpose(text: string, seed?: number): Promise<Superposition>;
}

/**
 * How a board element is lifted into the third dimension: time is depth. Pure geometry, so it
 * can be tested without a renderer.
 */
export interface DepthMapping {
  /** Depth in board units for an element created at `createdAt`, given the board's time span. */
  depth(createdAt: number, span: { start: number; end: number }): number;
}
