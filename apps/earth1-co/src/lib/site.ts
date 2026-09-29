export const site = {
  name: "earth1",
  domain: "earth1.co",
  url: "https://earth1.co",
  org: "Earth 1 Coalescent",
  motto: "Global citizenship for all.",
  description:
    "Earth 1 Coalescent — the working notes behind e1-4.com. Consciousness, citizenship, synthesis.",
  contactEmail: "[CONTACT EMAIL]",
  keywords: [
    "global citizenship",
    "global citizen",
    "world citizen",
    "citizen of the world",
    "Earth 1 Coalescent",
    "earth1",
    "data sovereignty",
    "digital rights",
    "free speech",
    "privacy",
  ],
  flagship: {
    name: "e1-4",
    domain: "e1-4.com",
    url: "https://e1-4.com",
    tagline: "earth life-forms",
  },
} as const;

export const cicero = {
  latin:
    "Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  english:
    "Nor is there anyone who loves pain itself, who seeks it out and wants to have it, simply because it is pain — but because, now and then, hard circumstance brings, through toil and pain, some great pleasure.",
  citation: "Cicero · De finibus bonorum et malorum · I.32 · 45 BC",
} as const;

export const manuscript = {
  src: "/manuscript/osu-frag-415-f75r.jpg",
  srcSmall: "/manuscript/osu-frag-415-f75r-640.jpg",
  width: 1177,
  height: 1707,
  alt: "A parchment leaf of Cicero's De finibus, copied in Italy around 1466: twenty-eight ruled lines of brown humanist script, a pencilled folio number 75 at the top right, and a later hand's note in the lower margin reading 1466 Cicero De Finibus.",
  caption: "De finibus bonorum et malorum, fol. 75r. Parchment, Veneto, c. 1450–1475.",
  credit:
    "Ohio State University, Rare Books & Manuscripts Library, SPEC.RARE.MS.MR.FRAG.415. Public domain (No Copyright – United States).",
  creditUrl: "https://hdl.handle.net/1811/d9d78a54-7116-4362-b5d6-383a1ac0b42e",
} as const;

export type Tenet = {
  glyph: string;
  glyphName: string;
  title: string;
  body: string;
  margin: string;
};

export const tenets: Tenet[] = [
  {
    glyph: "Ψ",
    glyphName: "psi",
    title: "Consciousness",
    body: "Extend how a person thinks and digests information. Not faster scrolling — a wider aperture. The instruments we build listen, transcribe, translate and draw, and then get out of the way of the mind that used them.",
    margin: "cf. the wavefunction: everything the system can be, before anyone looks.",
  },
  {
    glyph: "⊕",
    glyphName: "circled plus",
    title: "Citizenship",
    body: "Dissolve borders as a unit of moral accounting. An Earth-centred utilitarian framework: the good is counted for the planet's population, not a passport's. Citizenship that extends beyond Earth when we do.",
    margin: "⊕ is also the astronomical symbol for Earth.",
  },
  {
    glyph: "∑",
    glyphName: "sigma",
    title: "Synthesis",
    body: "Knowledge and entertainment at all costs — and the two are not enemies. Synthesis is the prerogative: the right to take everything said and make of it one thing worth keeping.",
    margin: "a sum, not an average.",
  },
];

export type Equation = {
  id: string;
  /** Plain-text rendering for copy/paste and the placeholder label. */
  text: string;
  /** Presentation MathML for the accessible fallback. */
  mathml: string;
  caption: string;
  name: string;
};

export const equations: Equation[] = [
  {
    id: "eq-schrodinger",
    name: "Schrödinger equation",
    text: "iħ ∂Ψ/∂t = ĤΨ",
    mathml:
      "<mrow><mi>i</mi><mi>ℏ</mi><mfrac><mrow><mo>∂</mo><mi mathvariant='normal'>Ψ</mi></mrow><mrow><mo>∂</mo><mi>t</mi></mrow></mfrac><mo>=</mo><mover><mi>H</mi><mo>^</mo></mover><mi mathvariant='normal'>Ψ</mi></mrow>",
    caption: "A wavefunction doesn't carry a passport.",
  },
  {
    id: "eq-einstein",
    name: "Einstein field equations",
    text: "Gμν + Λgμν = (8πG/c⁴) Tμν",
    mathml:
      "<mrow><msub><mi>G</mi><mrow><mi>μ</mi><mi>ν</mi></mrow></msub><mo>+</mo><mi mathvariant='normal'>Λ</mi><msub><mi>g</mi><mrow><mi>μ</mi><mi>ν</mi></mrow></msub><mo>=</mo><mfrac><mrow><mn>8</mn><mi>π</mi><mi>G</mi></mrow><msup><mi>c</mi><mn>4</mn></msup></mfrac><msub><mi>T</mi><mrow><mi>μ</mi><mi>ν</mi></mrow></msub></mrow>",
    caption: "Spacetime curves the same way on every side of every border.",
  },
];
