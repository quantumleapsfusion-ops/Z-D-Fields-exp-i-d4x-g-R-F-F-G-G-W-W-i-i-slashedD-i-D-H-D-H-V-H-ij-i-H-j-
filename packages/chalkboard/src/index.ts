/**
 * e1-4 2D: the Infinity Chalkboard.
 *
 * What a board is, independent of how it is drawn or stored. The working implementation is in
 * `apps/e1-4-com/src/lib/chalkboard` and `src/features/chalkboard`; this package exists so the
 * board can one day move out of the app without changing what the app calls. No code runs here.
 */

/** A point in board space, in board units (not pixels). */
export type Point = { x: number; y: number };

/** Every mark a person leaves on a board carries these. */
export interface ElementBase {
  id: string;
  color: string;
  /** Unix milliseconds. The 3D and 4D views read it as the time axis. */
  createdAt: number;
}

export interface Stroke extends ElementBase {
  type: "stroke";
  /** Flat x,y pairs, as the pen moved. */
  points: number[];
  width: number;
}

export interface Line extends ElementBase {
  type: "line";
  /** Exactly two points, as four numbers. */
  points: [number, number, number, number];
  width: number;
  arrow: boolean;
}

export interface Rect extends ElementBase {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
}

export interface Ellipse extends ElementBase {
  type: "ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  strokeWidth: number;
}

/** Words placed on the board. On e1-4 they arrive by voice; `typed` is kept for imports. */
export interface Text extends ElementBase {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  source: "voice" | "typed";
}

/** An equation, as LaTeX source. */
export interface Equation extends ElementBase {
  type: "math";
  x: number;
  y: number;
  tex: string;
  fontSize: number;
}

export type BoardElement = Stroke | Line | Rect | Ellipse | Text | Equation;

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

/** One saved board. `version` lets a reader refuse what it does not understand. */
export interface BoardDocument {
  version: 1;
  elements: BoardElement[];
  viewport: Viewport;
}

/** Where boards are kept. The app has a browser-local store and a Postgres-backed one. */
export interface BoardStore {
  list(ownerId: string): Promise<{ id: string; title: string | null; updatedAt: Date }[]>;
  load(ownerId: string, boardId: string): Promise<BoardDocument | null>;
  save(ownerId: string, boardId: string, board: BoardDocument): Promise<void>;
  remove(ownerId: string, boardId: string): Promise<void>;
}

/** Turns a spoken sentence into marks. Da Vinci provides this; the board only asks. */
export interface SpeechToBoard {
  place(said: string, at: Point, board: BoardDocument): Promise<BoardElement[]>;
}
