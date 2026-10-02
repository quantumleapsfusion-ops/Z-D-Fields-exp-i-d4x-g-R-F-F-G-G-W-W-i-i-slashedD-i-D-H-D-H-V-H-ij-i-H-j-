import { biochemistryTopics } from "./topics";
import type { FieldSection } from "./types";

export const biochemistry: FieldSection = {
  slug: "biochemistry",
  title: "Biochemistry",
  line: "The chemistry that keeps every cell alive.",
  intro: [
    "Biochemistry sits between the chemistry and biology pages. It asks how a cell gets energy from food, how it copies itself, and how a gene becomes a working protein. The answers are the same in bacteria, oak trees and people, which is one of the clearest signs that all life is related.",
  ],
  topics: biochemistryTopics,
  figures: [
    {
      slug: "leonor-michaelis",
      name: "Leonor Michaelis",
      born: "1875",
      died: "1949",
      field: ["Biochemistry"],
      contributions: [
        "With Maud Menten in Berlin in 1913, measured how the rate of the enzyme invertase depends on the concentration of sucrose, and wrote down the rate law now named after them both.",
        "Worked on pH and buffers, and later on oxidation–reduction in organic molecules at the Rockefeller Institute in New York.",
      ],
      quotes: [],
    },
    {
      slug: "maud-menten",
      name: "Maud Menten",
      born: "1879",
      died: "1960",
      field: ["Biochemistry", "Medicine"],
      contributions: [
        "Co-author of the 1913 Michaelis–Menten paper, which made enzyme kinetics a quantitative science.",
        "Took her medical degree at the University of Toronto in 1911 and spent most of her career at the University of Pittsburgh, working in pathology and medical research.",
      ],
      quotes: [],
    },
    {
      slug: "hans-krebs",
      name: "Hans Krebs",
      born: "1900",
      died: "1981",
      field: ["Biochemistry"],
      contributions: [
        "With Kurt Henseleit in 1932, found the urea cycle, the first metabolic cycle to be described.",
        "In 1937, with William Arthur Johnson in Sheffield, described the citric acid cycle, the hub where the breakdown of sugars, fats and proteins meets.",
        "Shared the 1953 Nobel Prize in Physiology or Medicine with Fritz Lipmann.",
      ],
      quotes: [],
    },
    {
      slug: "fritz-lipmann",
      name: "Fritz Lipmann",
      born: "1899",
      died: "1986",
      field: ["Biochemistry"],
      contributions: [
        "Argued in 1941 that energy-rich phosphate bonds, above all in ATP, carry energy between the reactions of the cell.",
        "Discovered coenzyme A, the carrier that brings acetyl groups into the citric acid cycle.",
      ],
      quotes: [],
    },
  ],
};
