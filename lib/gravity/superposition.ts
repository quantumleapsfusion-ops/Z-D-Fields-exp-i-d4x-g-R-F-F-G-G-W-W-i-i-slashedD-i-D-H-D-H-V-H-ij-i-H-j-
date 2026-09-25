import { z } from 'zod';

/**
 * Gravity Board (EXPERIMENTAL). Honest prototype of "transcription becomes topology":
 * - `density()` is a heuristic for when an idea is "dense enough" to cross the event horizon.
 * - The stochastic step samples several interpretations (LLM at high temperature, or a random stub).
 * - `resolve()` picks the likeliest interpretation until the user chooses otherwise.
 * Nothing here realises a 4D spacetime; the 3D collapse is a visual mock-up.
 */

export const FORMS = ['sphere', 'torus', 'knot', 'spiral', 'wave', 'lattice'] as const;
export type Form = (typeof FORMS)[number];

export const candidateSchema = z.object({
  title: z.string().min(1).max(80),
  interpretation: z.string().min(1).max(600),
  form: z.enum(FORMS).catch('sphere'),
  confidence: z.number().min(0).max(1).catch(0.5),
});
export const superpositionSchema = z.object({ candidates: z.array(candidateSchema).min(1).max(6) });

export type Candidate = z.infer<typeof candidateSchema>;
export type Superposition = {
  candidates: Candidate[];
  source: 'llm' | 'stub';
  resolvedIndex: number;
};

export const EVENT_HORIZON = 0.7;

const STOP = new Set(
  'a an the and or but so of to in on at for with is are was were be been it this that i you we they he she my our your as by from if then than'.split(
    ' ',
  ),
);

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((w) => !STOP.has(w));
}

/** 0..1 — how "dense" the idea is: length, lexical variety, long words and clause count. */
export function density(text: string): number {
  const all = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  if (all.length === 0) return 0;
  const content = words(text);
  const variety = new Set(content).size / Math.max(1, all.length);
  const long = content.filter((w) => w.length >= 8).length / Math.max(1, content.length);
  const clauses = (
    text.match(/[,;:—–]|\b(because|therefore|which|where|whereas|although|if)\b/gi) ?? []
  ).length;
  const score =
    Math.min(1, all.length / 60) * 0.45 +
    variety * 0.25 +
    long * 0.2 +
    Math.min(1, clauses / 6) * 0.1;
  return Math.min(1, score);
}

/** Heuristic resolution: model confidence blended with overlap against what was actually said. */
export function resolve(text: string, candidates: Candidate[]): number {
  const said = new Set(words(text));
  let best = 0;
  let bestScore = -1;
  candidates.forEach((c, i) => {
    const w = words(`${c.title} ${c.interpretation}`);
    const overlap = w.filter((x) => said.has(x)).length / Math.max(1, w.length);
    const score = c.confidence * 0.6 + overlap * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

export const SUPERPOSE_SYSTEM_PROMPT = `You are the stochastic intelligence behind the Gravity Board.
The user has spoken an idea too dense for one reading. Hold it in superposition: return 4 genuinely
DIFFERENT interpretations of what they might mean (different framings, not paraphrases).
For each, choose the topology that best fits its shape: ${FORMS.join(', ')}.
Reply with ONLY JSON: {"candidates":[{"title":s,"interpretation":s,"form":s,"confidence":0..1}]}`;

const FRAMES: {
  title: (k: string) => string;
  body: (k: string, o: string) => string;
  form: Form;
}[] = [
  {
    title: (k) => `${k} as a system`,
    body: (k, o) =>
      `You are describing ${k} as a set of interacting parts — ${o} is one of them, and the behaviour lives in how they connect.`,
    form: 'lattice',
  },
  {
    title: (k) => `${k} as a cycle`,
    body: (k, o) =>
      `${cap(k)} returns on itself: what looks like progress through ${o} loops back to where it began.`,
    form: 'torus',
  },
  {
    title: (k) => `${k} as a gradient`,
    body: (k, o) => `${cap(k)} is not a thing but a slope — everything flows from ${o} toward it.`,
    form: 'wave',
  },
  {
    title: (k) => `${k} as growth`,
    body: (k, o) => `${cap(k)} unfolds outward from ${o}, each turn a little larger than the last.`,
    form: 'spiral',
  },
  {
    title: (k) => `${k} entangled`,
    body: (k, o) =>
      `${cap(k)} and ${o} cannot be described separately; change one and the other moves.`,
    form: 'knot',
  },
  {
    title: (k) => `${k} as a whole`,
    body: (k, o) => `Step back: ${k} and ${o} are the same object seen from two sides.`,
    form: 'sphere',
  },
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Artificial random intelligence": the no-key stub samples framings at random. */
export function stubSuperpose(text: string, random: () => number = Math.random): Superposition {
  const freq = new Map<string, number>();
  for (const w of words(text)) if (w.length > 3) freq.set(w, (freq.get(w) ?? 0) + 1);
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w);
  const key = ranked[0] ?? 'the idea';
  const other = ranked[1] ?? 'what surrounds it';
  const pool = [...FRAMES];
  const candidates: Candidate[] = [];
  while (candidates.length < 4 && pool.length) {
    const frame = pool.splice(Math.floor(random() * pool.length), 1)[0];
    candidates.push({
      title: frame.title(key),
      interpretation: frame.body(key, other),
      form: frame.form,
      confidence: Math.round((0.3 + random() * 0.6) * 100) / 100,
    });
  }
  return { candidates, source: 'stub', resolvedIndex: resolve(text, candidates) };
}
