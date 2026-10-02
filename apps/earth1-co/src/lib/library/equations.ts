import type { Equation } from "./types";

export const equations: Equation[] = [
  {
    id: "planck-relation",
    name: "The Planck relation",
    formula: "E = hν",
    tex: String.raw`E = h\nu`,
    year: "1900",
    explain:
      "Light of frequency ν comes in packets of energy E, and the packet size is fixed by one new constant of nature, h. Planck wrote it down to fit the glow of hot objects; it turned out to be the first line of the quantum story.",
    symbols:
      "E energy · ν frequency · h Planck's constant, 6.62607015 × 10⁻³⁴ joule-seconds (exact since 2019)",
    people: ["max-planck", "albert-einstein"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "photoelectric",
    name: "The photoelectric equation",
    formula: "K = hν − φ",
    year: "1905",
    explain:
      "Shine light on a metal and electrons come out, but only if each packet of light carries enough energy. Brighter light of the wrong colour does nothing. Einstein read this as light really arriving in quanta.",
    symbols:
      "K kinetic energy of the freed electron · φ the energy the metal holds its electrons with",
    people: ["albert-einstein"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "bohr-levels",
    name: "Bohr's hydrogen levels",
    formula: "Eₙ = −13.6 eV / n²",
    year: "1913",
    explain:
      "An electron in hydrogen can only sit at certain energies, numbered n = 1, 2, 3 … Jumping between them releases or absorbs light of exactly matching colours, which is why every element has its own fingerprint of spectral lines.",
    symbols: "n whole number · eV electron-volt",
    people: ["niels-bohr"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "de-broglie",
    name: "The de Broglie wavelength",
    formula: "λ = h / p",
    tex: String.raw`\lambda = \frac{h}{p}`,
    year: "1924",
    explain:
      "Every moving thing has a wavelength: the heavier or faster it is, the shorter it gets. For a tennis ball it is absurdly small. For an electron it is about the size of an atom, so electrons can interfere like waves.",
    symbols: "λ wavelength · p momentum (mass × velocity)",
    people: ["louis-de-broglie"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "schrodinger",
    name: "The Schrödinger equation",
    formula: "iħ ∂ψ/∂t = Ĥψ",
    tex: String.raw`i\hbar\,\frac{\partial}{\partial t}\,\psi = \hat{H}\,\psi`,
    year: "1926",
    explain:
      "The rule for how a quantum state changes in time. ψ, the wave function, holds everything that can be known about a system; Ĥ is its energy. Between measurements, ψ evolves smoothly and predictably, and all the strangeness lives in how we read it.",
    symbols:
      "ψ wave function · Ĥ the Hamiltonian (total-energy operator) · ħ = h/2π · i the square root of −1",
    people: ["erwin-schrodinger"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "born-rule",
    name: "The Born rule",
    formula: "P(x) = |ψ(x)|²",
    tex: String.raw`P(x) = \lvert\psi(x)\rvert^{2}`,
    year: "1926",
    explain:
      "The wave function does not say where a particle is. Square its size at a point and you get the probability of finding the particle there. This is where chance enters physics at its foundation.",
    symbols: "P probability · |ψ|² the squared magnitude of the wave function",
    people: ["max-born"],
    sections: ["quantum-mechanics", "quantum-computing"],
  },
  {
    id: "commutator",
    name: "Position and momentum do not commute",
    formula: "x̂p̂ − p̂x̂ = iħ",
    year: "1925",
    explain:
      "In the matrix formulation, the order in which you measure position and momentum matters. This single fact, from Heisenberg, Born and Jordan, is the algebra underneath the uncertainty principle.",
    people: ["werner-heisenberg", "max-born"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "uncertainty",
    name: "The uncertainty principle",
    formula: "Δx · Δp ≥ ħ / 2",
    tex: String.raw`\Delta x\,\Delta p \ge \frac{\hbar}{2}`,
    year: "1927",
    explain:
      "A quantum state cannot have a sharply defined position and a sharply defined momentum at once. This is not clumsy instruments: the two quantities simply are not both sharp in nature. Squeeze one and the other spreads.",
    symbols: "Δx spread in position · Δp spread in momentum",
    people: ["werner-heisenberg"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "dirac",
    name: "The Dirac equation",
    formula: "(iħγᵘ∂ᵤ − mc)ψ = 0",
    tex: String.raw`\left(i\hbar\gamma^{\mu}\partial_{\mu} - mc\right)\psi = 0`,
    year: "1928",
    explain:
      "Quantum mechanics made compatible with special relativity. It gave the electron its spin automatically and predicted a mirror particle with opposite charge, the positron, found four years later. It was the first prediction of antimatter.",
    symbols: "γᵘ Dirac matrices · m electron mass · c speed of light",
    people: ["paul-dirac"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "exclusion",
    name: "The Pauli exclusion principle",
    formula: "ψ(a, b) = −ψ(b, a)",
    year: "1925",
    explain:
      "Swap two electrons and the wave function flips sign. A consequence: no two electrons can occupy the same state. It is why atoms have shells, why the periodic table has its shape, and why matter does not collapse into a point.",
    people: ["wolfgang-pauli"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "path-integral",
    name: "The path integral",
    formula: "⟨b|a⟩ = ∫ e^{iS[x]/ħ} 𝒟x",
    year: "1948",
    explain:
      "To find how likely a particle is to get from a to b, add up every possible route, each weighted by a phase set by its action S. Most routes cancel; the ones that survive are the paths nature appears to take.",
    symbols: "S the action along a path · 𝒟x sum over all paths",
    people: ["richard-feynman"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "bell-state",
    name: "An entangled pair (a Bell state)",
    formula: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    tex: String.raw`\lvert\Phi^{+}\rangle = \frac{\lvert 00\rangle + \lvert 11\rangle}{\sqrt{2}}`,
    year: "1935 / 1964",
    explain:
      "Two qubits that are each undecided, but whose answers are locked together: measure one and get 0, and the other will give 0; get 1, and it gives 1. No message passes between them. Bell's theorem shows that no scheme of answers fixed in advance, with nothing acting at a distance, can reproduce these results, and experiments confirm it.",
    people: ["albert-einstein", "erwin-schrodinger", "john-bell"],
    sections: ["quantum-mechanics", "quantum-computing"],
  },
  {
    id: "chsh",
    name: "The Bell (CHSH) inequality",
    formula: "|S| ≤ 2 classically, up to 2√2 in quantum theory",
    year: "1964 / 1969",
    explain:
      "Combine four correlation measurements into a number S. Any theory in which outcomes are fixed in advance by local hidden facts can never exceed 2. Quantum mechanics can reach about 2.83, and experiments from 1972 onward have seen values above 2.",
    people: ["john-bell", "alain-aspect-john-clauser-anton-zeilinger"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "von-neumann-entropy",
    name: "Von Neumann entropy",
    formula: "S(ρ) = −Tr(ρ ln ρ)",
    year: "1927",
    explain:
      "A measure of how mixed or uncertain a quantum state is. A pure state has zero; the half of an entangled pair, looked at alone, is maximally mixed. It later became the measure of entanglement.",
    symbols: "ρ density matrix · Tr trace",
    people: ["john-von-neumann"],
    sections: ["quantum-mechanics"],
  },
  {
    id: "qubit",
    name: "The qubit",
    formula: "|ψ⟩ = α|0⟩ + β|1⟩,  |α|² + |β|² = 1",
    tex: String.raw`\lvert\psi\rangle = \alpha\lvert 0\rangle + \beta\lvert 1\rangle,\quad \lvert\alpha\rvert^{2} + \lvert\beta\rvert^{2} = 1`,
    year: "1995",
    explain:
      "A quantum bit is not 0 or 1 but a blend of both, with amplitudes α and β. Measuring gives 0 with probability |α|² and 1 with probability |β|², and the blend is gone. The skill of quantum computing is steering the amplitudes before you look.",
    symbols: "α, β complex amplitudes",
    people: ["benjamin-schumacher"],
    sections: ["quantum-computing"],
  },
  {
    id: "hadamard",
    name: "The Hadamard gate",
    formula: "H|0⟩ = (|0⟩ + |1⟩) / √2",
    tex: String.raw`H\lvert 0\rangle = \frac{\lvert 0\rangle + \lvert 1\rangle}{\sqrt{2}}`,
    year: "—",
    explain:
      "The gate that turns a definite 0 into an even blend of 0 and 1. Almost every quantum algorithm starts by applying it to every qubit so that the circuit works on an equal blend of all possible inputs, which interference then sorts out.",
    people: ["david-deutsch"],
    sections: ["quantum-computing"],
  },
  {
    id: "cnot",
    name: "The CNOT gate",
    formula: "CNOT|a, b⟩ = |a, a ⊕ b⟩",
    year: "—",
    explain:
      "Flip the second qubit if, and only if, the first is 1. Together with single-qubit gates it can build any quantum computation, and applied to a blend it is what creates entanglement.",
    symbols: "⊕ addition modulo 2",
    people: ["david-deutsch"],
    sections: ["quantum-computing"],
  },
  {
    id: "no-cloning",
    name: "The no-cloning theorem",
    formula: "no operation U with U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for every |ψ⟩",
    year: "1982",
    explain:
      "An unknown quantum state cannot be copied. That is what makes quantum messages impossible to eavesdrop on without a trace, and what makes error correction in a quantum computer so much harder than in a classical one.",
    people: ["wojciech-zurek"],
    sections: ["quantum-mechanics", "quantum-computing"],
  },
  {
    id: "shor",
    name: "Shor's period-finding step",
    formula:
      "f(x) = aˣ mod N has period r  →  gcd(a^{r/2} ± 1, N) shares a factor with N",
    year: "1994",
    explain:
      "Factoring a large number reduces to finding the period of a repeating sequence. A quantum computer can find that period quickly by interference, where the best known classical methods slow down dramatically as the number grows.",
    people: ["peter-shor"],
    sections: ["quantum-computing"],
  },
  {
    id: "grover",
    name: "Grover's search",
    formula: "about (π/4)·√N steps to find one item among N",
    year: "1996",
    explain:
      "Searching an unsorted list of N items classically takes about N/2 tries on average. Grover's algorithm needs about √N, by repeatedly nudging amplitude toward the right answer. A real speed-up, but only a quadratic one.",
    people: ["lov-grover"],
    sections: ["quantum-computing"],
  },
  {
    id: "threshold",
    name: "The threshold theorem",
    formula:
      "physical error rate p < p_threshold  ⇒  logical errors fall as the code grows",
    year: "1996–1998",
    explain:
      "If each operation is wrong less often than a critical rate, then spending more qubits on error correction makes the encoded result more reliable, without limit. Whether real hardware sits below that line is the central engineering question of the field.",
    people: ["peter-shor", "alexei-kitaev"],
    sections: ["quantum-computing"],
  },
];

export const equationById = new Map(equations.map((e) => [e.id, e]));
