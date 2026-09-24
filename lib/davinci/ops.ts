import { z } from 'zod';

/** Da Vinci draws on a fixed virtual canvas; the client scales it to fit. */
export const CANVAS = { width: 1000, height: 640 } as const;

const coord = z.number().finite();
const color = z.string().max(32).default('#f1ede1');
const animate = z.enum(['draw', 'fade', 'pulse', 'float']).default('draw');

export const drawOpSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('circle'),
    x: coord,
    y: coord,
    r: coord,
    color,
    fill: z.string().max(32).optional(),
    animate,
  }),
  z.object({
    kind: z.literal('rect'),
    x: coord,
    y: coord,
    w: coord,
    h: coord,
    color,
    fill: z.string().max(32).optional(),
    animate,
  }),
  z.object({
    kind: z.literal('line'),
    points: z.array(coord).min(4).max(400),
    color,
    width: z.number().positive().max(40).default(3),
    animate,
  }),
  z.object({
    kind: z.literal('path'),
    points: z.array(coord).min(4).max(400),
    color,
    width: z.number().positive().max(40).default(3),
    closed: z.boolean().optional(),
    fill: z.string().max(32).optional(),
    animate,
  }),
  z.object({
    kind: z.literal('text'),
    x: coord,
    y: coord,
    text: z.string().max(200),
    color,
    size: z.number().positive().max(200).default(28),
    animate,
  }),
]);

export const drawResponseSchema = z.object({
  caption: z.string().max(300).default(''),
  ops: z.array(drawOpSchema).max(24),
});

export type DrawOp = z.infer<typeof drawOpSchema>;
export type DrawResponse = z.infer<typeof drawResponseSchema> & { source: 'llm' | 'stub' };

export const DRAW_SYSTEM_PROMPT = `You are Da Vinci, a live sketch artist. The user is describing something out loud.
You receive the full transcript so far, the newest words, and a summary of what is already on the canvas.
Add to the drawing so it keeps up with what they are describing. Never redraw what is already there.

Canvas: ${CANVAS.width}x${CANVAS.height}, origin top-left. Background is a dark chalkboard (#0e1a13).
Prefer chalk colours: #f1ede1 (chalk), #93a294 (dust), #d3a34c (ochre), plus soft pastels.

Reply with ONLY JSON matching:
{"caption": string, "ops": Op[]}  (at most 10 new ops)
Op is one of:
{"kind":"circle","x":n,"y":n,"r":n,"color":s,"fill"?:s,"animate"?:"draw"|"fade"|"pulse"|"float"}
{"kind":"rect","x":n,"y":n,"w":n,"h":n,"color":s,"fill"?:s,"animate"?:...}
{"kind":"line","points":[x1,y1,x2,y2,...],"color":s,"width"?:n,"animate"?:...}
{"kind":"path","points":[x1,y1,...],"color":s,"width"?:n,"closed"?:bool,"fill"?:s,"animate"?:...}
{"kind":"text","x":n,"y":n,"text":s,"color":s,"size"?:n,"animate"?:...}`;

export function summarizeOps(ops: DrawOp[]): string {
  if (ops.length === 0) return 'Canvas is empty.';
  const counts = ops.reduce<Record<string, number>>((acc, op) => {
    acc[op.kind] = (acc[op.kind] ?? 0) + 1;
    return acc;
  }, {});
  const labels = ops.flatMap((op) => (op.kind === 'text' ? [op.text] : [])).slice(-12);
  return `${ops.length} ops (${Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')}). Labels: ${labels.join(' | ') || 'none'}.`;
}

// ---------- Stub renderer (no LLM key) ----------

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return Math.abs(h);
}

type Motif = (x: number, y: number) => DrawOp[];

const MOTIFS: Record<string, Motif> = {
  sun: (x, y) => [
    {
      kind: 'circle',
      x,
      y,
      r: 48,
      color: '#d3a34c',
      fill: 'rgba(211,163,76,0.25)',
      animate: 'pulse',
    },
    ...Array.from({ length: 8 }, (_, i): DrawOp => {
      const a = (i / 8) * Math.PI * 2;
      return {
        kind: 'line',
        points: [
          x + Math.cos(a) * 62,
          y + Math.sin(a) * 62,
          x + Math.cos(a) * 88,
          y + Math.sin(a) * 88,
        ],
        color: '#d3a34c',
        width: 3,
        animate: 'draw',
      };
    }),
  ],
  moon: (x, y) => [
    {
      kind: 'circle',
      x,
      y,
      r: 40,
      color: '#f1ede1',
      fill: 'rgba(241,237,225,0.15)',
      animate: 'fade',
    },
    {
      kind: 'circle',
      x: x + 18,
      y: y - 10,
      r: 34,
      color: '#0e1a13',
      fill: '#0e1a13',
      animate: 'fade',
    },
  ],
  star: (x, y) => [
    {
      kind: 'path',
      closed: true,
      color: '#e9d25a',
      width: 2,
      animate: 'pulse',
      points: Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 30 : 12;
        return [x + Math.cos(a) * r, y + Math.sin(a) * r];
      }).flat(),
    },
  ],
  tree: (x, y) => [
    { kind: 'line', points: [x, y + 80, x, y], color: '#93a294', width: 6, animate: 'draw' },
    {
      kind: 'circle',
      x,
      y: y - 30,
      r: 50,
      color: '#6cc07a',
      fill: 'rgba(108,192,122,0.2)',
      animate: 'draw',
    },
  ],
  house: (x, y) => [
    { kind: 'rect', x: x - 60, y: y - 20, w: 120, h: 90, color: '#f1ede1', animate: 'draw' },
    {
      kind: 'path',
      points: [x - 72, y - 20, x, y - 80, x + 72, y - 20],
      color: '#d3a34c',
      width: 4,
      animate: 'draw',
    },
    { kind: 'rect', x: x - 14, y: y + 30, w: 28, h: 40, color: '#93a294', animate: 'draw' },
  ],
  mountain: (x, y) => [
    {
      kind: 'path',
      points: [x - 160, y + 80, x - 60, y - 60, x, y + 10, x + 70, y - 90, x + 170, y + 80],
      color: '#93a294',
      width: 4,
      animate: 'draw',
    },
    {
      kind: 'path',
      points: [x + 45, y - 55, x + 70, y - 90, x + 95, y - 55],
      color: '#f1ede1',
      width: 3,
      animate: 'draw',
    },
  ],
  wave: (x, y) => [
    {
      kind: 'path',
      points: Array.from({ length: 13 }, (_, i) => [x - 180 + i * 30, y + Math.sin(i) * 16]).flat(),
      color: '#4aa6d8',
      width: 4,
      animate: 'float',
    },
    {
      kind: 'path',
      points: Array.from({ length: 13 }, (_, i) => [
        x - 180 + i * 30,
        y + 30 + Math.sin(i + 1) * 16,
      ]).flat(),
      color: '#4aa6d8',
      width: 3,
      animate: 'float',
    },
  ],
  cloud: (x, y) => [
    {
      kind: 'circle',
      x: x - 35,
      y,
      r: 28,
      color: '#f1ede1',
      fill: 'rgba(241,237,225,0.12)',
      animate: 'float',
    },
    {
      kind: 'circle',
      x,
      y: y - 16,
      r: 36,
      color: '#f1ede1',
      fill: 'rgba(241,237,225,0.12)',
      animate: 'float',
    },
    {
      kind: 'circle',
      x: x + 38,
      y,
      r: 26,
      color: '#f1ede1',
      fill: 'rgba(241,237,225,0.12)',
      animate: 'float',
    },
  ],
  bird: (x, y) => [
    {
      kind: 'path',
      points: [x - 30, y, x - 12, y - 14, x, y, x + 12, y - 14, x + 30, y],
      color: '#f1ede1',
      width: 3,
      animate: 'float',
    },
  ],
  person: (x, y) => [
    { kind: 'circle', x, y: y - 50, r: 16, color: '#f1ede1', animate: 'draw' },
    { kind: 'line', points: [x, y - 34, x, y + 20], color: '#f1ede1', width: 3, animate: 'draw' },
    {
      kind: 'line',
      points: [x - 28, y - 14, x + 28, y - 14],
      color: '#f1ede1',
      width: 3,
      animate: 'draw',
    },
    {
      kind: 'path',
      points: [x - 22, y + 60, x, y + 20, x + 22, y + 60],
      color: '#f1ede1',
      width: 3,
      animate: 'draw',
    },
  ],
  heart: (x, y) => [
    {
      kind: 'path',
      closed: true,
      color: '#e8574a',
      width: 3,
      fill: 'rgba(232,87,74,0.2)',
      animate: 'pulse',
      points: Array.from({ length: 24 }, (_, i) => {
        const t = (i / 24) * Math.PI * 2;
        return [
          x + 2 * 16 * Math.sin(t) ** 3,
          y - 2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
        ];
      }).flat(),
    },
  ],
  circle: (x, y) => [{ kind: 'circle', x, y, r: 50, color: '#f1ede1', animate: 'draw' }],
  square: (x, y) => [
    { kind: 'rect', x: x - 50, y: y - 50, w: 100, h: 100, color: '#f1ede1', animate: 'draw' },
  ],
  arrow: (x, y) => [
    { kind: 'line', points: [x - 80, y, x + 80, y], color: '#d3a34c', width: 4, animate: 'draw' },
    {
      kind: 'path',
      points: [x + 60, y - 16, x + 80, y, x + 60, y + 16],
      color: '#d3a34c',
      width: 4,
      animate: 'draw',
    },
  ],
};

const SYNONYMS: Record<string, string> = {
  sunshine: 'sun',
  sunrise: 'sun',
  sunset: 'sun',
  stars: 'star',
  galaxy: 'star',
  trees: 'tree',
  forest: 'tree',
  home: 'house',
  building: 'house',
  mountains: 'mountain',
  hill: 'mountain',
  hills: 'mountain',
  sea: 'wave',
  ocean: 'wave',
  water: 'wave',
  river: 'wave',
  waves: 'wave',
  clouds: 'cloud',
  sky: 'cloud',
  birds: 'bird',
  man: 'person',
  woman: 'person',
  people: 'person',
  child: 'person',
  love: 'heart',
  ball: 'circle',
  planet: 'circle',
  box: 'square',
  cube: 'square',
  toward: 'arrow',
  towards: 'arrow',
  then: 'arrow',
};

/**
 * Keyword-driven sketch used when no LLM key is configured. Clearly a stub: it recognises a small
 * vocabulary of motifs and otherwise pins the key words to the board.
 */
export function stubDraw(newText: string, existing: DrawOp[]): DrawResponse {
  const words = newText.toLowerCase().match(/[a-z']+/g) ?? [];
  const ops: DrawOp[] = [];
  const found: string[] = [];
  for (const word of words) {
    const motif = MOTIFS[word] ? word : SYNONYMS[word];
    if (!motif || found.includes(motif)) continue;
    found.push(motif);
    const seed = hash(`${motif}:${existing.length + ops.length}`);
    const x = 140 + (seed % (CANVAS.width - 280));
    const y = 140 + ((seed >> 8) % (CANVAS.height - 280));
    ops.push(...MOTIFS[motif](x, y));
  }
  if (found.length === 0) {
    const keyword = [...words].sort((a, b) => b.length - a.length)[0];
    if (keyword && keyword.length > 3) {
      const seed = hash(`${keyword}:${existing.length}`);
      ops.push({
        kind: 'text',
        x: 80 + (seed % (CANVAS.width - 260)),
        y: 60 + ((seed >> 8) % (CANVAS.height - 120)),
        text: keyword,
        color: '#93a294',
        size: 30,
        animate: 'fade',
      });
    }
  }
  return {
    source: 'stub',
    caption: found.length ? `Sketching: ${found.join(', ')}` : 'Listening…',
    ops,
  };
}
