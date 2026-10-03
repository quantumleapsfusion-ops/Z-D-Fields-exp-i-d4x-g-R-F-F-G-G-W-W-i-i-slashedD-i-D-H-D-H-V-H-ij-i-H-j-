import { elements } from "./elements";
import { equations } from "@/lib/library/equations";
import { people } from "@/lib/library/people";
import { planets } from "./planets";
import { symbols } from "./symbols";

export type Topic =
  "symbols" | "elements" | "planets" | "black-holes" | "equations" | "people";
export type Question = {
  id: string;
  topic: Topic;
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

type QuestionSeed = Omit<Question, "choices" | "answer"> & {
  correct: string;
  pool: string[];
};

type Concept = { id: string; prompt: string; answer: string; explain: string };

const blackHoleConcepts: Concept[] = [
  {
    id: "horizon",
    prompt: "What is the event horizon?",
    answer: "The boundary from inside which light cannot escape to distant observers.",
    explain: "The event horizon is a causal boundary, not a material surface.",
  },
  {
    id: "rs",
    prompt: "For a non-spinning black hole, what does the Schwarzschild radius describe?",
    answer: "The radius of its event horizon.",
    explain:
      "The Schwarzschild radius is 2GM/c² for a non-rotating, uncharged black hole.",
  },
  {
    id: "photon",
    prompt: "Where is the photon sphere of a Schwarzschild black hole?",
    answer: "At 1.5 Schwarzschild radii.",
    explain:
      "The photon sphere is an unstable circular orbit for light at 3GM/c² = 1.5 rₛ.",
  },
  {
    id: "isco",
    prompt: "Where is the ISCO for a non-spinning black hole?",
    answer: "At 3 Schwarzschild radii.",
    explain:
      "For a Schwarzschild black hole, the innermost stable circular orbit lies at 6GM/c² = 3 rₛ.",
  },
  {
    id: "hawking",
    prompt: "What is Hawking radiation?",
    answer:
      "A predicted quantum effect that gives black holes a temperature and lets them radiate.",
    explain:
      "Hawking radiation has not been directly detected from an astrophysical black hole.",
  },
  {
    id: "temperature",
    prompt: "How does Hawking temperature change when black-hole mass increases?",
    answer: "It decreases in inverse proportion to mass.",
    explain: "For a Schwarzschild black hole, Tₕ = ℏc³/(8πGMkB).",
  },
  {
    id: "evaporation",
    prompt: "How does idealised black-hole evaporation time scale with mass?",
    answer: "It scales approximately as the cube of the mass.",
    explain:
      "The semiclassical lifetime is proportional to M³, ignoring accretion and other effects.",
  },
  {
    id: "shadow",
    prompt: "What does the dark region in an Event Horizon Telescope image represent?",
    answer: "A black-hole shadow shaped by captured light and gravitational lensing.",
    explain:
      "The observed bright emission ring surrounds a shadow larger than the event horizon.",
  },
  {
    id: "eht-m87",
    prompt: "Which black hole did the Event Horizon Telescope image in 2019?",
    answer: "M87*.",
    explain: "The EHT released its first black-hole image, of M87*, in April 2019.",
  },
  {
    id: "eht-sgr",
    prompt: "Which black hole did the Event Horizon Telescope image in 2022?",
    answer: "Sagittarius A* at the centre of the Milky Way.",
    explain: "The EHT collaboration presented the image of Sagittarius A* in 2022.",
  },
  {
    id: "singularity",
    prompt:
      "What does classical general relativity predict at the centre of an ideal black hole?",
    answer:
      "A singularity where the classical theory stops giving a regular spacetime description.",
    explain:
      "A singularity signals that classical general relativity is incomplete there; quantum gravity is expected to matter.",
  },
  {
    id: "disk",
    prompt: "Why can matter in an accretion disk shine brightly before falling in?",
    answer:
      "Friction and compression convert gravitational energy into heat and radiation.",
    explain:
      "The emission comes from hot material outside the horizon, not from inside it.",
  },
  {
    id: "isco-spin",
    prompt: "What can change the ISCO location from 3 rₛ?",
    answer: "The black hole's spin and the orbit's direction.",
    explain: "The 3 rₛ value applies to a non-spinning Schwarzschild black hole.",
  },
  {
    id: "lensing",
    prompt: "What does gravitational lensing do to light passing near a black hole?",
    answer: "It bends the light path and can magnify or multiply background images.",
    explain:
      "In the weak-field limit, the point-mass deflection is approximately 4GM/(c²b).",
  },
  {
    id: "time",
    prompt:
      "How does a stationary clock near a Schwarzschild black hole compare with a distant clock?",
    answer: "It runs slower relative to the distant clock.",
    explain: "For a stationary observer outside the horizon the factor is √(1 − rₛ/r).",
  },
  {
    id: "mass",
    prompt: "What determines a Schwarzschild black hole's radius?",
    answer: "Its mass.",
    explain: "The radius grows linearly with mass: rₛ = 2GM/c².",
  },
  {
    id: "light",
    prompt: "Can light escape from inside the event horizon?",
    answer: "No; all future-directed paths remain inside the horizon.",
    explain: "This is the defining causal property of an event horizon.",
  },
  {
    id: "rotation",
    prompt:
      "What additional feature does a rotating black hole have in general relativity?",
    answer: "Frame dragging around the rotating mass.",
    explain: "Rotation twists spacetime and produces the Kerr geometry.",
  },
  {
    id: "hawking-mass",
    prompt:
      "Which would have the higher Hawking temperature: a small or a very massive black hole?",
    answer: "The smaller black hole.",
    explain: "Hawking temperature is inversely proportional to mass.",
  },
  {
    id: "sun-collapse",
    prompt: "Could the Sun become a black hole through ordinary stellar evolution?",
    answer: "No; it is far below the mass needed for core collapse into a black hole.",
    explain: "The Sun is expected to end as a white dwarf, not a black hole.",
  },
  {
    id: "binary",
    prompt: "What can gravitational waves reveal about a merging black-hole binary?",
    answer: "The changing orbit and properties such as the component masses and spins.",
    explain: "The waveform encodes the inspiral, merger, and ringdown.",
  },
  {
    id: "shadow-not-horizon",
    prompt: "Is the visible dark shadow the same size as the event horizon?",
    answer: "No; gravitational lensing makes the shadow larger than the horizon.",
    explain: "The Schwarzschild shadow radius for distant observers is √27/2 rₛ.",
  },
  {
    id: "escape",
    prompt:
      "What happens to the Newtonian escape-speed formula at a black hole's horizon?",
    answer: "It reaches the speed of light at the Schwarzschild radius.",
    explain:
      "This is a useful heuristic; the horizon itself is properly described by general relativity.",
  },
  {
    id: "black-hole-light",
    prompt: "Why do black holes appear dark against space?",
    answer: "Light from inside the event horizon cannot reach a distant observer.",
    explain: "Matter outside the horizon can still emit brightly in an accretion flow.",
  },
  {
    id: "ton-618",
    prompt: "What is TON 618?",
    answer: "A quasar associated with an extremely massive, estimated black hole.",
    explain: "Its mass is estimated from observations and depends on the method used.",
  },
  {
    id: "stellar-mass",
    prompt: "How can a stellar-mass black hole form?",
    answer:
      "The core of a sufficiently massive star can collapse after it exhausts its nuclear fuel.",
    explain: "The exact remnant depends on the progenitor and mass loss.",
  },
  {
    id: "no-hair",
    prompt:
      "In the classical no-hair description, which properties characterize an isolated black hole?",
    answer: "Mass, angular momentum, and electric charge.",
    explain: "Astrophysical black holes are expected to have negligible net charge.",
  },
];

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const unique = (items: string[]) => [...new Set(items)];
const symbolPool = unique(symbols.flatMap((symbol) => symbol.meanings));
const elementNames = elements.map((element) => element.name);
const atomicNumbers = elements.map((element) => String(element.z));
const planetNames = planets.map((planet) => planet.name);
const equationFormulas = unique(equations.map((equation) => equation.formula));
const peopleKnown = people.map((person) => person.known);
const blackHoleAnswers = unique(blackHoleConcepts.map((concept) => concept.answer));

const questionSeeds: Record<Topic, QuestionSeed[]> = {
  symbols: symbols.map((symbol, index) => ({
    id: `symbol-${index}-${symbol.glyph}`,
    topic: "symbols",
    prompt: `What is a common meaning of ${symbol.glyph} (${symbol.name})?`,
    correct: symbol.meanings[0],
    pool: symbolPool,
    explain: `${symbol.glyph} (${symbol.name}): ${symbol.meanings[0]}`,
  })),
  elements: elements.flatMap((element) => [
    {
      id: `element-symbol-${element.z}`,
      topic: "elements" as const,
      prompt: `Which element has the symbol ${element.symbol}?`,
      correct: element.name,
      pool: elementNames,
      explain: `${element.symbol} is ${element.name}, element ${element.z}.`,
    },
    {
      id: `element-number-${element.z}`,
      topic: "elements" as const,
      prompt: `What is the atomic number of ${element.name} (${element.symbol})?`,
      correct: String(element.z),
      pool: atomicNumbers,
      explain: `The atomic number is the proton count; ${element.name} has ${element.z}.`,
    },
  ]),
  planets: [
    {
      id: "planet-most-moons",
      topic: "planets",
      prompt: "Which planet has the most currently known moons in this data set?",
      correct: planets.reduce((a, b) => (a.moons > b.moons ? a : b)).name,
      pool: planetNames,
      explain:
        "Saturn leads this snapshot with 274 known moons; the count changes as more are found.",
    },
    {
      id: "planet-most-massive",
      topic: "planets",
      prompt: "Which planet is the most massive?",
      correct: planets.reduce((a, b) => (a.massEarths > b.massEarths ? a : b)).name,
      pool: planetNames,
      explain: "Jupiter is the most massive planet, at about 317.8 Earth masses.",
    },
    {
      id: "planet-longest-day",
      topic: "planets",
      prompt: "Which planet has the longest solar day in the data set?",
      correct: planets.reduce((a, b) => (a.dayHours > b.dayHours ? a : b)).name,
      pool: planetNames,
      explain:
        "Venus has the longest solar day here, about 2,802 hours, and rotates retrograde.",
    },
    {
      id: "planet-fastest-rotation",
      topic: "planets",
      prompt: "Which planet has the shortest day?",
      correct: planets.reduce((a, b) => (a.dayHours < b.dayHours ? a : b)).name,
      pool: planetNames,
      explain: "Jupiter rotates fastest, completing a day in about 9.9 hours.",
    },
    {
      id: "planet-hottest",
      topic: "planets",
      prompt: "Which planet has the highest mean surface temperature?",
      correct: planets.reduce((a, b) => (a.meanTempC > b.meanTempC ? a : b)).name,
      pool: planetNames,
      explain:
        "Venus is hottest at the surface because of its dense greenhouse atmosphere.",
    },
    {
      id: "planet-largest",
      topic: "planets",
      prompt: "Which planet has the largest diameter?",
      correct: planets.reduce((a, b) => (a.diameterKm > b.diameterKm ? a : b)).name,
      pool: planetNames,
      explain: "Jupiter is the largest planet by diameter.",
    },
    {
      id: "planet-farthest",
      topic: "planets",
      prompt: "Which planet is farthest from the Sun?",
      correct: planets.reduce((a, b) => (a.distanceAU > b.distanceAU ? a : b)).name,
      pool: planetNames,
      explain: "Neptune is the outermost of the eight planets.",
    },
    {
      id: "planet-retrograde",
      topic: "planets",
      prompt: "Which planet's retrograde rotation gives it a westward sunrise?",
      correct: "Venus",
      pool: planetNames,
      explain:
        "Venus rotates retrograde; Uranus also rotates on its side with a retrograde sense.",
    },
  ],
  "black-holes": blackHoleConcepts.map((concept) => ({
    id: `black-hole-${concept.id}`,
    topic: "black-holes",
    prompt: concept.prompt,
    correct: concept.answer,
    pool: blackHoleAnswers,
    explain: concept.explain,
  })),
  equations: equations.map((equation) => ({
    id: `equation-${equation.id}`,
    topic: "equations",
    prompt: `Which formula belongs to “${equation.name}”?`,
    correct: equation.formula,
    pool: equationFormulas,
    explain: equation.explain,
  })),
  people: people.map((person) => ({
    id: `person-${person.slug}`,
    topic: "people",
    prompt: `What is ${person.name} known for?`,
    correct: person.known,
    pool: peopleKnown,
    explain: `${person.name}: ${person.known}`,
  })),
};

export function buildQuiz(opts: {
  topics: Topic[];
  count: number;
  seed: number;
}): Question[] {
  const random = mulberry32(opts.seed);
  const topicSet = new Set(opts.topics);
  const available = unique(
    opts.topics
      .flatMap((topic) => questionSeeds[topic] ?? [])
      .map((question) => question.id),
  );
  const byId = new Map(
    opts.topics
      .flatMap((topic) => questionSeeds[topic] ?? [])
      .map((question) => [question.id, question]),
  );
  const selected = shuffle(available, random).slice(
    0,
    Math.max(0, Math.floor(opts.count)),
  );
  return selected.flatMap((id) => {
    const question = byId.get(id);
    if (!question || !topicSet.has(question.topic)) return [];
    const distractors = shuffle(
      unique(question.pool).filter((choice) => choice !== question.correct),
      random,
    ).slice(0, 3);
    if (distractors.length !== 3) return [];
    const choices = shuffle([question.correct, ...distractors], random);
    return [
      {
        id: question.id,
        topic: question.topic,
        prompt: question.prompt,
        choices,
        answer: choices.indexOf(question.correct),
        explain: question.explain,
      },
    ];
  });
}
