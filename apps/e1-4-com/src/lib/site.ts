export const site = {
  name: "e1-4",
  domain: "e1-4.com",
  url: "https://e1-4.com",
  org: "Earth One Global Coalescent",
  hero: "Greetings Earthling.",
  motto: "Think.",
  subhead: "one voice, five dimensions",
  tagline: "earth life-forms",
  pitch: "A social network with no typing. You speak; everything else follows.",
  philosophyUrl: "https://earth1.co",
  philosophyLabel: "earth1.co",
  description:
    "e1-4, earth life-forms. A voice-only social network: speak, and transcription, translation and visuals follow. Built by Earth One Global Coalescent.",
} as const;

export type FeatureStatus = "ready" | "early" | "experimental";
export type Dimension = 1 | 2 | 3 | 4 | 5;

export type Feature = {
  dimension: Dimension;
  title: string;
  href: string;
  short: string;
  status: FeatureStatus;
  codenames?: string;
  body: string;
  keywords?: string[];
};

export const features: Feature[] = [
  {
    dimension: 1,
    title: "Voice Stream",
    href: "/stream",
    short: "Stream",
    status: "ready",
    body: "Record phrases here. Your stream feeds the other surfaces.",
  },
  {
    dimension: 2,
    title: "Infinity Chalkboard",
    href: "/chalkboard",
    short: "Board",
    status: "ready",
    codenames: "Speech to Text // Binary // Sparks // Big-Bang",
    body: "Place words and drawings from your stream on an open board.",
  },
  {
    dimension: 3,
    title: "Gravity Chalkboard",
    href: "/gravity",
    short: "Gravity",
    status: "experimental",
    codenames: "Topologoical Black Hole // Gravity // Depth",
    body: "View your chalkboard in three dimensions. Time sets the depth.",
  },
  {
    dimension: 4,
    title: "Event Horizon",
    href: "/horizon",
    short: "Horizon",
    status: "experimental",
    codenames: "Event Horizon // Singularity // Spacetime",
    body: "Track phrase density across your stream.",
    keywords: ["event horizon", "singularity", "spacetime"],
  },
  {
    dimension: 5,
    title: "Superposition",
    href: "/superposition",
    short: "Ari",
    status: "experimental",
    codenames: "ARI // Stochastic I // Schroodinger // Quantum",
    body: "Compare readings of your stream.",
  },
];

export const daVinci = {
  title: "Da Vinci",
  codenames: "Inteligence // Heisenberg × Poincaré",
  body: "Moves between every dimension. Press Ctrl+K on any page.",
} as const;
