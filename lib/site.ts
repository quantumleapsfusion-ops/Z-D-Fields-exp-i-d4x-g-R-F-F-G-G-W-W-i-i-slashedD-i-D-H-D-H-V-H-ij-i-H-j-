export const site = {
  name: 'e1-4',
  domain: 'e1-4.com',
  url: 'https://e1-4.com',
  org: 'Earth One Global Coalescent',
  motto: 'Think.',
  tagline: 'four ways to speak',
  philosophyUrl: 'https://earth1.co',
  philosophyLabel: 'earth1.co',
  description:
    'e1-4.com — earth life-forms. Four ways to speak, built by Earth One Global Coalescent.',
} as const;

export type Feature = {
  title: string;
  codenames?: string;
  body: string;
  keywords?: string[];
  emphasis?: boolean;
};

export const features: Feature[] = [
  {
    title: 'Voice Stream',
    body: 'One continuous recording per person, pausable and resumable on a whim. Not a post — an audio diary that runs for as long as a life does.',
  },
  {
    title: 'Da Vinci',
    codenames: 'Inteligence // ARI // Stochastic I // Schroodinger',
    body: "An assistant that listens as you speak, transcribes it as it's meant to be read, and draws what you're describing while you're still describing it.",
  },
  {
    title: 'Infinity Chalkboard',
    codenames: 'Speech to Text // Binary // Sparks // Big-Bang',
    body: 'An unbounded board for working through the hard ideas out loud — physics, mechanics, anything too spatial for a sentence — in two dimensions, then three, then four.',
  },
  {
    title: 'Gravity Board',
    codenames: 'Topologoical Black Hole // Event Horizon // Superposition // Quantum',
    body: "The chalkboard's edge case. Say something dense enough and it collapses past its own event horizon — a stochastic intelligence holds every version of the idea in superposition on the other side, until the board is ready to show you which one you meant. Transcription becomes topology: mock-ups, animation, a four-dimensional spacetime you can turn around and walk into.",
    keywords: [
      'event horizon',
      'singularity',
      'spacetime superposition',
      'artificial random intelligence / artificial stochastic intelligence',
    ],
    emphasis: true,
  },
];
