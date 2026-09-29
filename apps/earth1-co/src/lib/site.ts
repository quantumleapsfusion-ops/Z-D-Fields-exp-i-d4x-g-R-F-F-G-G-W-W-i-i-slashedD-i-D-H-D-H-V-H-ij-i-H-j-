export const site = {
  name: "Earth 1",
  domain: "earth1.co",
  url: "https://earth1.co",
  org: "Earth 1 Coalescent",
  motto: "Global Citizenship For All.",
  description:
    "Earth 1 Coalescent — global citizenship for all. Consciousness, citizenship and synthesis; the philosophy behind e1-4.com.",
  /** Placeholder until the address is confirmed. */
  contactEmail: "[CONTACT EMAIL]",
  flagship: {
    name: "e1-4",
    domain: "e1-4.com",
    url: "https://e1-4.com",
    tagline: "earth life-forms",
    pitch: "The social network you speak, not type.",
  },
} as const;

export const nav = [
  { label: "Mission", href: "#mission" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "e1-4", href: site.flagship.url, external: true },
  { label: "Contact", href: "#contact" },
] as const;

export const cicero = {
  placeholder:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  latin:
    "Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  english:
    "Nor is there anyone who loves pain itself, who seeks it out and wants to have it, simply because it is pain — but because, now and then, hard circumstance brings, through toil and pain, some great pleasure.",
  citation: "CICERO · DE FINIBUS BONORUM ET MALORUM I.32 · 45 BC",
} as const;

export const mission = {
  lines: [
    "The internet filled space with words nobody was meant to read.",
    "Earth 1 exists to reverse that.",
  ],
  pillars: [
    {
      glyph: "Ψ",
      title: "Consciousness",
      body: "Extend how we think and digest information — speech first, so the idea arrives at the speed it was had.",
    },
    {
      glyph: "⊕",
      title: "Citizenship",
      body: "Dissolve borders. An Earth-centred utilitarian framework, and a citizenship that does not stop at Earth.",
    },
    {
      glyph: "∑",
      title: "Synthesis",
      body: "Knowledge and entertainment at all costs. Synthesis is the prerogative.",
    },
  ],
} as const;

export const philosophy = {
  statement: site.motto,
  support:
    "One planet, one civic body. Borders are a legacy interface; the person speaking is the citizen.",
} as const;
