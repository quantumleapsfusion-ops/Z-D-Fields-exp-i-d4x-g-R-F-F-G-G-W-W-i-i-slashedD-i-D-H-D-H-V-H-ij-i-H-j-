export const site = {
  name: "earth1",
  domain: "earth1.co",
  url: "https://earth1.co",
  org: "Earth One Global Coalescent",
  tagline: "A coalescent, not a corporation.",
  description:
    "Earth One Global Coalescent — the holding shell and governance portal behind e1-4.com. Absolute data sovereignty, user-controlled privacy, free speech.",
  flagship: {
    name: "e1-4",
    domain: "e1-4.com",
    url: "https://e1-4.com",
    tagline: "earth life-forms",
    pitch: "A social network with no typing. You speak; everything else follows.",
  },
} as const;

export type Principle = {
  index: string;
  title: string;
  body: string;
};

export const principles: Principle[] = [
  {
    index: "I",
    title: "Absolute data sovereignty",
    body: "What you say is yours. Every recording, transcript and drawing on an Earth One platform belongs to the person who made it, is stored under their identifier, and leaves with them in one export or one deletion — audio, rows, and account, in that order, with nothing retained.",
  },
  {
    index: "II",
    title: "User-controlled privacy",
    body: "Private by default. Nothing is public until its owner says so, per segment, per link, per person — and every grant can be revoked. Access rules are enforced at the database and storage layer, not in a settings page.",
  },
  {
    index: "III",
    title: "Free speech",
    body: "Voice is the medium because voice is the person. We do not edit, rank, or suppress what people say. We build the tools that make it legible — transcription, translation, drawing — and leave the judgement to the listener.",
  },
  {
    index: "IV",
    title: "Legible machines",
    body: "Where a model listens, draws, or summarises, we say which one, what it cost, and where it was wrong. Intelligence on our platforms is a labelled instrument, never an unmarked author.",
  },
];
