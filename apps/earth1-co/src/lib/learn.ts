export const learn = [
  {
    slug: "chemistry",
    title: "Chemistry",
    line: "The science of atoms and bonds.",
  },
  {
    slug: "physics",
    title: "Physics",
    line: "The same laws hold on every shore.",
  },
  {
    slug: "biology",
    title: "Biology",
    line: "Life and systems.",
  },
  {
    slug: "mathematics",
    title: "Mathematics",
    line: "The one language every nation already shares.",
  },
  {
    slug: "quantum-mechanics",
    title: "Quantum Mechanics",
    line: "The rules of the very small.",
  },
  {
    slug: "quantum-computing",
    title: "Quantum Computing",
    line: "Computing with quantum bits.",
  },
  {
    slug: "global-citizenship",
    title: "Global Citizenship",
    line: "Every person on Earth is a citizen of it.",
  },
] as const;

export type LearnSlug = (typeof learn)[number]["slug"];
