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
    id: "biology",
    title: "Biology",
    question:
      "How do the letters of life—DNA, RNA, and proteins—build every organism from a single cell?",
    focus: ["Genetics", "Evolution", "Molecular biology"],
    reference: {
      title: "Nature · Life Sciences",
      url: "https://www.nature.com/subjects/biology",
    },
  },
] as const;
