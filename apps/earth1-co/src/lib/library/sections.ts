import type { SectionSlug } from "./types";

export type Concept = { id: string; title: string; body: string[]; equation?: string };
export type TimelineEntry = { year: string; text: string; person?: string };

export type SectionContent = {
  slug: SectionSlug;
  title: string;
  /** Used for the <title> and meta description. */
  description: string;
  line: string;
  intro: string[];
  concepts: Concept[];
  timeline: TimelineEntry[];
};

export const quantumMechanics: SectionContent & {
  interpretations: {
    name: string;
    by: string;
    claim: string;
    cost: string;
    people?: string[];
  }[];
} = {
  slug: "quantum-mechanics",
  title: "Quantum Mechanics",
  description:
    "The story of quantum mechanics from Planck to Bell, with plain-language explanations of superposition, entanglement, uncertainty, measurement and the main interpretations, and a profile of each of its founders.",
  line: "The strangest theory ever to be right about everything it has been tested on.",
  intro: [
    "In 1900 a conservative German professor patched a formula to fit the glow of a hot oven and, almost by accident, began the biggest revision in the history of physics. Within thirty years a handful of people, most of them under thirty, had rebuilt our picture of matter. Atoms, chemistry, lasers, transistors, MRI scanners, the sunlight that powers every living thing: all of it is quantum mechanics at work.",
    "The theory has never failed an experiment, and nobody fully agrees on what it means. Einstein spent his last decades unconvinced; Feynman said nobody understands it; Bell showed that the argument could be settled by experiment, and the experiments came down against the simplest escape routes. What follows is the story as it happened, who did what, and why it mattered.",
  ],
  concepts: [
    {
      id: "quanta",
      title: "Energy comes in packets",
      body: [
        "Nature does not hand out energy in any amount. Light of a given colour arrives in indivisible packets, and the size of the packet is fixed by its frequency. The same is true of the energies of electrons in atoms, which is why a neon sign glows in sharp colours instead of a smooth rainbow.",
        "That is all the word 'quantum' means: a smallest packet. The constant that sets the size is so small (6.6 × 10⁻³⁴ joule-seconds) that we never notice in daily life.",
      ],
      equation: "planck-relation",
    },
    {
      id: "wave-particle",
      title: "Waves that are also particles",
      body: [
        "Light shows interference like water waves, yet is absorbed in lumps like bullets. Electrons, which seem like tiny balls, produce interference patterns too. Fire them one at a time at a screen with two slits and each lands as a single dot, but after thousands the dots build a striped wave pattern, as though each electron went through both slits and interfered with itself.",
        "Bohr's way of putting it was complementarity: wave and particle are two aspects of one thing, and which you see depends on the experiment you set up. Try the experiment below.",
      ],
      equation: "de-broglie",
    },
    {
      id: "superposition",
      title: "Superposition",
      body: [
        "Before it is measured, a quantum system need not be in any one of the states you might find it in. It is described by a wave function that includes several possibilities at once, each with an amplitude, a number that can be positive, negative or even complex.",
        "This is not the same as ignorance. If the electron were simply in one slit or the other and we didn't know which, the pattern would be two blobs. The stripes appear because the possibilities can add up and cancel, which probabilities never do. That cancellation, interference, is the fingerprint of superposition, and it is the resource a quantum computer uses.",
      ],
      equation: "schrodinger",
    },
    {
      id: "measurement",
      title: "Measurement and the Born rule",
      body: [
        "Look, and you find one definite result, never a blend. The rule discovered by Max Born says that the chance of each result is the squared size of its amplitude. Quantum theory predicts probabilities, not single outcomes, and no one has found anything underneath that fixes which outcome occurs.",
        "The measurement problem is the awkward fact that the theory has two rules: smooth evolution between measurements, and a sudden jump when one is made. Nothing in the equations says what counts as a measurement. Every interpretation below is an answer to that.",
      ],
      equation: "born-rule",
    },
    {
      id: "uncertainty",
      title: "Uncertainty",
      body: [
        "A particle with a precisely known position is a very narrow wave, and building a narrow wave requires adding together many wavelengths, which means many momenta. Making position sharper makes momentum fuzzier, and vice versa. This is a feature of waves in general, which is why it also appears in sound and in radio.",
        "Heisenberg's insight was that it is not a limitation of our instruments but a property of what a particle is. It also explains why atoms are stable: squeezing an electron into the nucleus would make its momentum, and so its energy, enormous.",
      ],
      equation: "uncertainty",
    },
    {
      id: "entanglement",
      title: "Entanglement",
      body: [
        "Two particles can be prepared so that the pair has a definite state while neither particle on its own does. Measure one and get 'up', and the other, however far away, will be found 'down'. Einstein, Podolsky and Rosen thought this showed that the particles must have carried the answers with them all along; Schrödinger named the phenomenon entanglement.",
        "In 1964 John Bell proved that the two pictures make different predictions in a carefully designed experiment. Since 1972, and decisively in the loophole-free experiments of 2015, nature has sided with quantum theory. This does not allow faster-than-light messages, since each side sees only random results until they compare notes. But it does mean that no theory in which every particle carries its own private instructions and nothing acts at a distance can be right.",
      ],
      equation: "bell-state",
    },
    {
      id: "decoherence",
      title: "Why the everyday world looks classical",
      body: [
        "A cat is not a lone electron. It is made of countless particles constantly bumping into air, light and each other, and each bump entangles the cat with its surroundings, smearing out interference where no one can recover it. This is decoherence, discovered by Dieter Zeh and developed by Wojciech Zurek, and it explains why we never see everyday objects in two places.",
        "It also explains why building a quantum computer is difficult: the whole machine must be shielded from its environment long enough to compute.",
      ],
    },
  ],
  interpretations: [
    {
      name: "Copenhagen",
      by: "Bohr, Heisenberg, Born",
      claim:
        "The wave function is a tool for predicting results of measurements. Asking what the system is doing between measurements is not meaningful. Measurements have definite outcomes because we, and our instruments, are described in classical terms.",
      cost: "It leaves the line between measurer and measured vague, and it is often accused of dodging the question.",
      people: ["niels-bohr", "werner-heisenberg", "max-born"],
    },
    {
      name: "Many worlds",
      by: "Everett, DeWitt, Deutsch",
      claim:
        "The wave function never collapses. Every possible outcome happens, in branches of reality that no longer interact. We experience one branch because we are in it.",
      cost: "An enormous multiplication of worlds, and a still-debated question of what probability means when everything happens.",
      people: ["hugh-everett", "david-deutsch"],
    },
    {
      name: "Pilot wave (de Broglie–Bohm)",
      by: "de Broglie, Bohm",
      claim:
        "Particles always have definite positions and are steered by the wave function. The randomness is ignorance of those positions. The theory gives the same predictions as standard quantum mechanics.",
      cost: "It is explicitly non-local and difficult to reconcile with relativity.",
      people: ["louis-de-broglie", "david-bohm"],
    },
    {
      name: "Objective collapse",
      by: "Ghirardi, Rimini, Weber; Penrose",
      claim:
        "Collapse is a real physical process that happens spontaneously, rarely for single particles and almost instantly for large objects, as a change to the Schrödinger equation.",
      cost: "It predicts small deviations from quantum mechanics, and experiments so far have not found them. The theories are constrained, but not excluded.",
    },
    {
      name: "QBism and relational views",
      by: "Fuchs, Caves, Schack; Rovelli",
      claim:
        "The wave function expresses an agent's expectations (QBism), or a state of one system relative to another (relational quantum mechanics), rather than a description of the world as it is in itself.",
      cost: "It can seem to give up on a single observer-independent reality, which many physicists are unwilling to do.",
    },
  ],
  timeline: [
    {
      year: "1900",
      text: "Planck proposes energy quanta to explain black-body radiation.",
      person: "max-planck",
    },
    {
      year: "1905",
      text: "Einstein explains the photoelectric effect with light quanta.",
      person: "albert-einstein",
    },
    {
      year: "1913",
      text: "Bohr's quantised atom explains the hydrogen spectrum.",
      person: "niels-bohr",
    },
    {
      year: "1924",
      text: "De Broglie proposes matter waves; Bose and Einstein found a new statistics.",
      person: "louis-de-broglie",
    },
    {
      year: "1925",
      text: "Heisenberg's matrix mechanics; Pauli's exclusion principle.",
      person: "werner-heisenberg",
    },
    {
      year: "1926",
      text: "Schrödinger's wave equation; Born's probability rule.",
      person: "erwin-schrodinger",
    },
    {
      year: "1927",
      text: "Uncertainty principle; the Solvay conference and Bohr–Einstein debates begin.",
      person: "niels-bohr",
    },
    {
      year: "1928",
      text: "Dirac's relativistic equation; antimatter is predicted.",
      person: "paul-dirac",
    },
    {
      year: "1935",
      text: "The EPR paper and Schrödinger's cat and entanglement.",
      person: "albert-einstein",
    },
    {
      year: "1948",
      text: "Feynman's path integral and diagrams make quantum field theory practical.",
      person: "richard-feynman",
    },
    { year: "1952", text: "Bohm revives pilot-wave theory.", person: "david-bohm" },
    {
      year: "1957",
      text: "Everett's relative-state formulation.",
      person: "hugh-everett",
    },
    { year: "1964", text: "Bell's theorem.", person: "john-bell" },
    { year: "1970", text: "Zeh discovers decoherence.", person: "hd-zeh" },
    {
      year: "1982",
      text: "Aspect's experiments; no-cloning theorem.",
      person: "alain-aspect-john-clauser-anton-zeilinger",
    },
    {
      year: "2015",
      text: "Loophole-free Bell tests in Delft, Vienna and Boulder.",
      person: "alain-aspect-john-clauser-anton-zeilinger",
    },
    {
      year: "2022",
      text: "Clauser, Aspect and Zeilinger receive the Nobel Prize in Physics.",
      person: "alain-aspect-john-clauser-anton-zeilinger",
    },
  ],
};

export const quantumComputing: SectionContent & {
  hardware: {
    name: string;
    how: string;
    strengths: string;
    challenges: string;
    people: string[];
  }[];
} = {
  slug: "quantum-computing",
  title: "Quantum Computing",
  description:
    "How quantum computers work and where the idea came from, from Feynman and Deutsch through Shor, Grover and error correction to superconducting, trapped-ion, photonic and neutral-atom hardware, with a profile of each pioneer.",
  line: "Computing with the same rules that govern atoms.",
  intro: [
    "In 1981 Richard Feynman pointed out that simulating even a modest molecule exactly on an ordinary computer is hopeless, because each added particle doubles the work. His suggestion was disarmingly simple: if nature computes with quantum rules, build the computer from quantum parts.",
    "Forty-odd years later machines with hundreds of qubits exist, the first error-corrected logical qubits have been demonstrated, and the questions are no longer whether it is possible but how soon, how large, and for what. This page follows the idea from its origins to the hardware, and is candid about what quantum computers are not good for.",
  ],
  concepts: [
    {
      id: "qubit",
      title: "The qubit",
      body: [
        "A classical bit is 0 or 1. A qubit is a quantum system with two states, conventionally |0⟩ and |1⟩, and it can be in a blend of both described by two amplitudes. Measuring it gives 0 or 1 with probabilities set by the squares of those amplitudes and leaves it in the result.",
        "Beware the common summary that a qubit 'is both 0 and 1 at once, so a quantum computer tries everything simultaneously'. A measurement still gives only one answer. What matters is that the amplitudes can be made to interfere.",
      ],
      equation: "qubit",
    },
    {
      id: "gates",
      title: "Gates and circuits",
      body: [
        "A quantum program is a sequence of gates, each a reversible rotation of the qubits' amplitudes. The Hadamard gate turns a definite 0 into an equal blend. The Pauli gates (X, Y, Z, named for Wolfgang Pauli's spin matrices) flip bits or phases. A phase gate changes a sign that cannot be seen directly but that matters later through interference.",
        "A two-qubit gate such as CNOT links qubits. The set of single-qubit gates plus CNOT is universal: any quantum computation can be written with them. Use the lab below to build the simplest entangled pair.",
      ],
      equation: "cnot",
    },
    {
      id: "entanglement",
      title: "Entanglement as a resource",
      body: [
        "With n qubits, the state needs 2ⁿ amplitudes to describe: 50 qubits means about a quadrillion numbers; 300 means more than the number of atoms in the visible universe. Entanglement is what lets the qubits share that space instead of each keeping its own two numbers.",
        "It is also what makes a quantum computer hard to build, since entanglement with the outside world is exactly the decoherence that ruins a computation.",
      ],
      equation: "bell-state",
    },
    {
      id: "interference",
      title: "Algorithms are choreography of interference",
      body: [
        "A quantum algorithm starts by spreading amplitude over many possible answers, then applies gates so that the wrong answers cancel and the right ones reinforce, then measures. Most problems offer no way to do this cleverly. The ones that do are special: Shor's algorithm exploits the hidden periodic structure in factoring; Grover's exploits the symmetry of search.",
      ],
    },
    {
      id: "why",
      title: "Why it matters, and what it will not do",
      body: [
        "The strongest known reasons are three. Simulating quantum systems, such as molecules, catalysts and exotic materials, is the original purpose and likely the first useful one. Factoring and discrete logarithms would let a large enough machine break today's public-key encryption, which is why governments are already standardising post-quantum cryptography. Search and optimisation get at most a modest speed-up in general.",
        "Quantum computers will not make every program faster, will not replace laptops, and are not known to solve NP-hard problems efficiently. Whether a given advantage survives clever new classical algorithms is a live question; several early 'supremacy' claims have been narrowed that way.",
      ],
    },
    {
      id: "error-correction",
      title: "Error correction: the real bottleneck",
      body: [
        "Qubits are fragile. Today's best physical gates fail roughly once in a thousand operations, with the best systems somewhat better; useful algorithms need billions without a mistake. In classical computing we copy bits and vote, but the no-cloning theorem forbids copying a quantum state.",
        "In 1995–96 Shor and Steane, with Calderbank, showed that you can spread one logical qubit over many physical ones and check for errors indirectly. The threshold theorem says that if physical error rates are below a critical value, adding more qubits makes the logical qubit more reliable without limit. In 2024 Google reported the first experiment where a surface code got better as it grew larger. The cost is steep: a useful machine likely needs hundreds to thousands of physical qubits for each logical one.",
      ],
      equation: "threshold",
    },
  ],
  hardware: [
    {
      name: "Superconducting circuits",
      how: "Tiny loops of superconducting metal, cooled to a few hundredths of a degree above absolute zero, behave as artificial atoms. Microwave pulses drive the gates.",
      strengths:
        "Very fast gates, built with chip-making techniques, easy to wire into 2-D grids. Used by IBM, Google, Rigetti and others.",
      challenges:
        "Short coherence times, extreme cooling, and wiring that becomes difficult as chips grow.",
      people: ["yasunobu-nakamura", "clarke-devoret-martinis"],
    },
    {
      name: "Trapped ions",
      how: "Individual charged atoms held in place by electric fields, with laser pulses for gates. All the ions of one type are identical by nature.",
      strengths:
        "The best gate accuracy of any platform and every qubit can interact with every other. Used by Quantinuum and IonQ.",
      challenges:
        "Gates are slow and large ion chains are hard to control; scaling needs moving ions between zones or linking traps.",
      people: ["ignacio-cirac-peter-zoller", "david-wineland"],
    },
    {
      name: "Photonic",
      how: "Qubits carried by single photons moving through optical circuits, with detectors for measurement. Gates come from interference and detection.",
      strengths:
        "Room-temperature operation for much of the system, natural link to optical fibre and networks. Pursued by PsiQuantum and Xanadu.",
      challenges:
        "Photons are lost and are hard to generate on demand, and the logic works probabilistically, demanding large overhead.",
      people: ["knill-laflamme-milburn", "jian-wei-pan"],
    },
    {
      name: "Neutral atoms",
      how: "Hundreds of uncharged atoms held by focused laser beams (optical tweezers) in arrays that can be rearranged mid-computation; strong interactions come from briefly exciting them to Rydberg states.",
      strengths:
        "Large arrays of identical qubits and flexible connectivity. Used by QuEra, Pasqal, Atom Computing and others.",
      challenges: "Slower cycles, atom loss, and keeping many laser beams steady.",
      people: ["mikhail-lukin"],
    },
  ],
  timeline: [
    {
      year: "1980",
      text: "Manin and Benioff each describe quantum mechanical computation.",
      person: "paul-benioff",
    },
    {
      year: "1981",
      text: "Feynman asks for a quantum computer to simulate nature (paper 1982).",
      person: "richard-feynman",
    },
    {
      year: "1984",
      text: "Bennett and Brassard publish BB84 quantum key distribution.",
      person: "charles-bennett-gilles-brassard",
    },
    {
      year: "1985",
      text: "Deutsch defines the universal quantum computer.",
      person: "david-deutsch",
    },
    {
      year: "1991",
      text: "Ekert's entanglement-based cryptography.",
      person: "artur-ekert",
    },
    {
      year: "1993",
      text: "Quantum teleportation protocol.",
      person: "charles-bennett-gilles-brassard",
    },
    { year: "1994", text: "Shor's factoring algorithm.", person: "peter-shor" },
    {
      year: "1995",
      text: "Schumacher names the qubit; first quantum error-correcting code; Cirac–Zoller ion proposal and first ion gate.",
      person: "benjamin-schumacher",
    },
    {
      year: "1996",
      text: "Grover's search algorithm; Steane and Calderbank–Shor codes.",
      person: "lov-grover",
    },
    {
      year: "1997",
      text: "Kitaev's toric code and topological quantum computation.",
      person: "alexei-kitaev",
    },
    { year: "1999", text: "First superconducting qubit.", person: "yasunobu-nakamura" },
    {
      year: "2001",
      text: "KLM linear-optics scheme; Shor's algorithm factors 15 on a 7-qubit device.",
      person: "knill-laflamme-milburn",
    },
    {
      year: "2012",
      text: "Wineland shares the Nobel Prize; Preskill names 'quantum supremacy'.",
      person: "david-wineland",
    },
    {
      year: "2019",
      text: "Google's Sycamore supremacy claim, contested by classical-simulation rebuttals.",
      person: "clarke-devoret-martinis",
    },
    {
      year: "2023",
      text: "Neutral-atom logical-qubit processor; Turing Award to Bennett and Brassard (announced 2024).",
      person: "mikhail-lukin",
    },
    {
      year: "2024",
      text: "Below-threshold surface code on Google's Willow chip; NIST publishes first post-quantum encryption standards.",
      person: "clarke-devoret-martinis",
    },
    {
      year: "2025",
      text: "Clarke, Devoret and Martinis receive the Nobel Prize in Physics.",
      person: "clarke-devoret-martinis",
    },
  ],
};

export const physics: SectionContent = {
  slug: "physics",
  title: "Physics & Gravity",
  description:
    "Simulations and explanations of gravitational physics, black holes, orbital mechanics, relativistic effects, and spacetime geometry.",
  line: "Gravity shapes the universe at every scale, from falling apples to colliding black holes.",
  intro: [
    "Gravity is the oldest mystery in physics. Before Newton, falling objects and moving planets seemed unrelated. Newton unified them with one inverse-square law. Einstein unified gravity with spacetime itself: mass bends spacetime, and objects follow the curves.",
    "This section explores the geometry of gravity through interactive simulations: the black hole horizon, the way light bends around massive objects, the dance of orbits, and the way time itself slows down in strong gravitational fields. These are not thought experiments. They are what has been measured by telescopes, gravitational wave detectors, and GPS satellites.",
  ],
  concepts: [
    {
      id: "schwarzschild",
      title: "Black Holes and the Event Horizon",
      body: [
        "When a massive star collapses, gravity becomes so strong that nothing can escape—not even light. The boundary of this region is the event horizon. It is not a wall: you could cross it without noticing anything special (though tidal forces would shred you). But to a distant observer, you would appear to slow down and freeze at the boundary.",
        "The event horizon's radius, called the Schwarzschild radius, is roughly 3 kilometers per solar mass. For the Sun, this is smaller than an atom. For a black hole of 10 solar masses, it is 30 kilometers. For the supermassive black holes at the centers of galaxies, it is millions of kilometers across.",
      ],
    },
    {
      id: "lensing",
      title: "Gravitational Lensing",
      body: [
        "Light follows the curves in spacetime just as planets do. A massive object can bend light rays, acting like a lens. This has been used to measure the masses of galaxies, to find exoplanets, and most dramatically, to see the shadow of a black hole silhouetted against its glowing accretion disk.",
        "The bending angle depends on how close the light ray passes the mass. For weak lensing (far from a black hole), it is proportional to the mass. For strong lensing near a black hole, light can be bent into spiral orbits, creating the 'photon ring' that frames the black hole's silhouette.",
      ],
    },
    {
      id: "accretion",
      title: "Accretion Disks and Energy Release",
      body: [
        "When material falls toward a black hole, conservation of angular momentum forces it into an orbit, forming a disk. Friction converts orbital energy to heat, reaching temperatures of millions of Kelvin. Black holes are often the brightest objects in their regions of space, shining in X-rays from the hot gas spiraling inward.",
        "This accretion process is not limited to black holes. Young stars are surrounded by accretion disks from which planets form. Neutron stars accreting from companions shine as X-ray binaries. The same physics, from substellar to supermassive scales.",
      ],
    },
    {
      id: "time-dilation",
      title: "Time Dilation",
      body: [
        "Einstein's theory predicts that time itself runs at different rates depending on gravity and motion. Near a black hole, time runs much slower than far away. An observer falling into a black hole experiences nothing special, but to a distant observer, they appear to freeze at the event horizon, taking infinite time to cross.",
        "This is not imagination. GPS satellites must account for time dilation, or they would accumulate errors of kilometers per day. Clocks at sea level run slower than clocks on mountains. The effect is tiny in everyday life but enormous near a black hole.",
      ],
    },
    {
      id: "orbits",
      title: "Orbits and Kepler's Laws",
      body: [
        "Objects in orbit obey Kepler's laws: planets closer to the Sun orbit faster and take less time to complete an orbit, following the inverse-square law. The same law governs stars orbiting black holes, moons orbiting planets, and galaxies orbiting each other.",
        "Near a black hole, relativistic effects modify these laws. The innermost stable circular orbit exists at just six times the event horizon radius. Any closer, and objects can no longer maintain a stable orbit; they must either fall in or escape.",
      ],
    },
  ],
  timeline: [
    {
      year: "1666",
      text: "Newton's inverse-square law of gravity; Kepler's laws explained.",
    },
    {
      year: "1783",
      text: "Michell and Laplace propose 'dark stars' so massive that light cannot escape.",
    },
    {
      year: "1915",
      text: "Einstein publishes general relativity; gravity is the curvature of spacetime.",
      person: "albert-einstein",
    },
    {
      year: "1916",
      text: "Schwarzschild discovers the metric describing a non-rotating black hole.",
    },
    {
      year: "1963",
      text: "Kerr discovers the metric for a rotating black hole.",
    },
    {
      year: "1967",
      text: "Jocelyn Bell and Antony Hewish discover pulsars; neutron stars revealed.",
    },
    {
      year: "1974",
      text: "Hawking predicts black holes emit radiation and can evaporate.",
    },
    {
      year: "1994",
      text: "Hubble Space Telescope measures the mass of the black hole at the center of M87.",
    },
    {
      year: "2015",
      text: "LIGO detects gravitational waves from two merging black holes.",
    },
    {
      year: "2019",
      text: "Event Horizon Telescope images the shadow of the black hole at the center of M87.",
    },
    {
      year: "2022",
      text: "Event Horizon Telescope images Sagittarius A*, the black hole at the center of our galaxy.",
    },
  ],
};

export const sectionList = [
  { slug: "quantum-mechanics", title: "Quantum Mechanics", line: quantumMechanics.line },
  { slug: "quantum-computing", title: "Quantum Computing", line: quantumComputing.line },
  { slug: "physics", title: "Physics & Gravity", line: physics.line },
] as const;
