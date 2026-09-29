import { z } from "zod";

export const FORMS = ["sphere", "torus", "knot", "spiral", "wave", "lattice"] as const;
export type Form = (typeof FORMS)[number];

export const candidateSchema = z.object({
  title: z.string().min(1).max(80),
  interpretation: z.string().min(1).max(600),
  form: z.enum(FORMS).catch("sphere"),
  confidence: z.number().min(0).max(1).catch(0.5),
});
export const superpositionSchema = z.object({
  candidates: z.array(candidateSchema).min(1).max(6),
});

export type Candidate = z.infer<typeof candidateSchema>;
export type Superposition = {
  candidates: Candidate[];
  source: "llm" | "stub";
  resolvedIndex: number;
};

export const EVENT_HORIZON = 0.7;

const STOP = new Set(
  "a an the and or but so of to in on at for with is are was were be been it this that i you we they he she my our your as by from if then than".split(
    " ",
  ),
);

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((w) => !STOP.has(w));
}

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

export const SUPERPOSE_SYSTEM_PROMPT = `Read the user's spoken text and return four distinct interpretations.
Use different ideas, not paraphrases. Choose a form that fits each interpretation: ${FORMS.join(", ")}.
Reply with ONLY JSON: {"candidates":[{"title":s,"interpretation":s,"form":s,"confidence":0..1}]}`;

const FRAMES: {
  title: (k: string) => string;
  body: (k: string, o: string) => string;
  form: Form;
}[] = [
  {
    title: (k) => `${k} as a system`,
    body: (k, o) =>
      `Think about ${k} through its parts, including ${o}, and how they affect each other.`,
    form: "lattice",
  },
  {
    title: (k) => `${k} as a cycle`,
    body: (k, o) =>
      `${cap(k)} may repeat: changes in ${o} can return the idea to where it started.`,
    form: "torus",
  },
  {
    title: (k) => `${k} as a gradient`,
    body: (k, o) => `${cap(k)} can change gradually as ${o} changes.`,
    form: "wave",
  },
  {
    title: (k) => `${k} as growth`,
    body: (k, o) =>
      `${cap(k)} can develop from ${o}, with each change affecting what comes next.`,
    form: "spiral",
  },
  {
    title: (k) => `${k} entangled`,
    body: (k, o) =>
      `${cap(k)} and ${o} may affect each other. Changing one can change the other.`,
    form: "knot",
  },
  {
    title: (k) => `${k} as a whole`,
    body: (k, o) =>
      `Look at ${k} and ${o} together. They may describe the same idea from two sides.`,
    form: "sphere",
  },
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function stubSuperpose(
  text: string,
  random: () => number = Math.random,
): Superposition {
  const freq = new Map<string, number>();
  for (const w of words(text)) if (w.length > 3) freq.set(w, (freq.get(w) ?? 0) + 1);
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w);
  const key = ranked[0] ?? "the idea";
  const other = ranked[1] ?? "what surrounds it";
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
  return { candidates, source: "stub", resolvedIndex: resolve(text, candidates) };
}
