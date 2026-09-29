export const site = {
  name: "e1-4",
  domain: "e1-4.com",
  url: "https://e1-4.com",
  org: "Earth 1 Coalescent",
  /** Large standalone hero statement. */
  hero: "Think.",
  /** Brand motto. */
  motto: "Think.",
  /** Features section title. */
  subhead: "four ways to speak",
  /** Approved tagline; used in metadata and as the hero label. */
  tagline: "earth life-forms",
  /** The one sentence on the homepage. */
  pitch: "The social network you speak, not type.",
  band: {
    statement: "No typing. Ever.",
    support: "Audiophiles in audiofiles.",
  },
  cta: "Start a Voice Stream",
  earlyAccess: "Get early access",
  credit:
    "Built by Earth 1 Coalescent — global citizenship for all, one voice at a time.",
  philosophyUrl: "https://earth1.co",
  philosophyLabel: "earth1.co",
  philosophyLine: "Read the philosophy at earth1.co",
  description:
    "e1-4 — earth life-forms. The social network you speak, not type: transcription, translation and visuals follow your voice. Built by Earth 1 Coalescent.",
  /** Mono keyword line under the feature grid. */
  keywordLine:
    "EVENT HORIZON · SINGULARITY · SPACETIME · SUPERPOSITION · ARI: ARTIFICIAL STOCHASTIC INTELLIGENCE",
} as const;

export type FeatureStatus = "ready" | "early" | "experimental";

export type Feature = {
  title: string;
  /** App route for the feature surface. */
  href: string;
  /** Production readiness, shown as a small label in the app. */
  status: FeatureStatus;
  codenames?: string;
  body: string;
  keywords?: string[];
  emphasis?: boolean;
};

export const features: Feature[] = [
  {
    title: "Voice Stream",
    href: "/stream",
    status: "ready",
    body: "One continuous recording per person, pausable and resumable on a whim. Not a post — an audio diary that runs for as long as a life does.",
  },
  {
    title: "Da Vinci",
    href: "/davinci",
    status: "early",
    codenames: "INTELLIGENCE // ARI // STOCHASTIC I // SCHRÖDINGER",
    body: "An assistant that listens as you speak, transcribes it as it's meant to be read, and draws what you're describing while you're still describing it.",
  },
  {
    title: "Infinity Chalkboard",
    href: "/chalkboard",
    status: "ready",
    codenames: "SPEECH TO TEXT // BINARY // SPARKS // BIG-BANG",
    body: "An unbounded board for working through the hard ideas out loud — physics, mechanics, anything too spatial for a sentence — in two dimensions, then three, then four.",
  },
  {
    title: "Gravity Board",
    href: "/gravity",
    status: "experimental",
    codenames: "TOPOLOGICAL BLACK HOLE // EVENT HORIZON // SUPERPOSITION // QUANTUM",
    body: "The chalkboard's edge case. Say something dense enough and it collapses past its own event horizon — a stochastic intelligence holds every version of the idea in superposition on the other side, until the board is ready to show you which one you meant. Transcription becomes topology: mock-ups, animation, a four-dimensional spacetime you can turn around and walk into.",
    keywords: [
      "event horizon",
      "singularity",
      "spacetime",
      "superposition",
      "ARI: artificial stochastic intelligence",
    ],
    emphasis: true,
  },
];

export const statusLabel: Record<FeatureStatus, string> = {
  ready: "Available",
  early: "Early access",
  experimental: "Experimental",
};
