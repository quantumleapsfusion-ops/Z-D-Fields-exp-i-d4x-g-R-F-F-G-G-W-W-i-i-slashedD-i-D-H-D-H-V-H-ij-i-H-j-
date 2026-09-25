import { z } from 'zod';

const point = z.number().finite();

const base = {
  id: z.string().min(1).max(64),
  color: z.string().max(32),
  /** Unix ms; also drives the (future) 4D time axis. */
  createdAt: z.number().int().nonnegative(),
};

export const elementSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('stroke'),
    points: z.array(point).max(20000),
    width: z.number().positive().max(200),
  }),
  z.object({
    ...base,
    type: z.literal('line'),
    points: z.array(point).length(4),
    width: z.number().positive().max(200),
    arrow: z.boolean(),
  }),
  z.object({
    ...base,
    type: z.literal('rect'),
    x: point,
    y: point,
    width: point,
    height: point,
    strokeWidth: z.number().positive().max(200),
  }),
  z.object({
    ...base,
    type: z.literal('ellipse'),
    x: point,
    y: point,
    radiusX: point,
    radiusY: point,
    strokeWidth: z.number().positive().max(200),
  }),
  z.object({
    ...base,
    type: z.literal('text'),
    x: point,
    y: point,
    text: z.string().max(5000),
    fontSize: z.number().positive().max(2000),
    /** `voice` text was placed by speech-to-text; `typed` by the keyboard. */
    source: z.enum(['voice', 'typed']),
  }),
]);

export const boardDocumentSchema = z.object({
  version: z.literal(1),
  elements: z.array(elementSchema).max(5000),
  viewport: z.object({ x: point, y: point, scale: z.number().positive() }),
});

export type BoardElement = z.infer<typeof elementSchema>;
export type BoardDocument = z.infer<typeof boardDocumentSchema>;

export const emptyBoard = (): BoardDocument => ({
  version: 1,
  elements: [],
  viewport: { x: 0, y: 0, scale: 1 },
});

export function parseBoardDocument(value: unknown): BoardDocument {
  return boardDocumentSchema.parse(value);
}
