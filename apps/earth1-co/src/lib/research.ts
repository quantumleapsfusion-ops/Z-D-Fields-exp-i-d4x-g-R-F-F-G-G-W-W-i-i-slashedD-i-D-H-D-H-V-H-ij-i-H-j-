export const research = [
  {
    id: "quantum-mechanics",
    title: "Quantum mechanics",
    question:
      "How do observation, superposition, and entanglement change the way we describe a system?",
    focus: ["Measurement", "Superposition", "Entanglement"],
    reference: {
      title: "NIST · Quantum Information Science",
      url: "https://www.nist.gov/quantum-information-science",
    },
  },
  {
    id: "quantum-computing",
    title: "Quantum computing",
    question:
      "What can circuits built from qubits do, and where do noise and error correction limit them?",
    focus: ["Qubits", "Circuits", "Error correction"],
    reference: {
      title: "IBM Quantum · Learning",
      url: "https://quantum.cloud.ibm.com/learning/en",
    },
  },
  {
    id: "chemistry",
    title: "Chemistry",
    question:
      "How do atoms bond, molecules react, and elements organize into patterns that shape all matter?",
    focus: ["Bonding", "Reaction kinetics", "Periodic table"],
    reference: {
      title: "NIST Chemistry WebBook",
      url: "https://webbook.nist.gov/",
    },
  },
  {
    id: "biology",
    title: "Biology",
    question:
      "How do cells replicate, organisms evolve, and populations adapt to their environment?",
    focus: ["DNA replication", "Evolution", "Population dynamics"],
    reference: {
      title: "National Human Genome Research Institute",
      url: "https://www.genome.gov/",
    },
  },
  {
    id: "biochemistry",
    title: "Biochemistry",
    question:
      "How do proteins fold, enzymes catalyze reactions, and cells harvest energy from molecules?",
    focus: ["Enzyme kinetics", "Protein folding", "Energy metabolism"],
    reference: {
      title: "NCBI Biochemistry",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK22430/",
    },
  },
  {
    id: "physics",
    title: "Physics",
    question:
      "What are the fundamental forces, and how do they govern motion, gravity, and the cosmos?",
    focus: ["Gravity", "Orbits", "Black holes"],
    reference: {
      title: "NASA · Physics of the Universe",
      url: "https://science.nasa.gov/physics/",
    },
  },
] as const;
