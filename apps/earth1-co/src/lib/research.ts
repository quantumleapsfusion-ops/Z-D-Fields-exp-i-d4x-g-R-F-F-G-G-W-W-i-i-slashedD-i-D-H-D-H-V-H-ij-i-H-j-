export const research = [
  {
    id: "mechanics",
    number: "01",
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
    id: "computing",
    number: "02",
    title: "Quantum computing",
    question:
      "What can circuits built from qubits do, and where do noise and error correction limit them?",
    focus: ["Qubits", "Circuits", "Error correction"],
    reference: {
      title: "IBM Quantum · Learning",
      url: "https://quantum.cloud.ibm.com/learning/en",
    },
  },
] as const;
