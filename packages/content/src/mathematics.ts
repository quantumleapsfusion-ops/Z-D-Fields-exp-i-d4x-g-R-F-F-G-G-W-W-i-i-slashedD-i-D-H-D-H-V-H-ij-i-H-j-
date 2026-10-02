import { mathematicsTopics } from "./topics";
import type { FieldSection } from "./types";

export const mathematics: FieldSection = {
  slug: "mathematics",
  title: "Mathematics",
  line: "The study of quantity, shape and structure.",
  intro: [
    "Mathematics is the language of pattern. Mathematicians ask what must be true if certain axioms are given, and they follow the logic wherever it leads. The answers turn out to describe the physical world with stunning accuracy, a mystery that physicists have puzzled over for centuries.",
    "Euclid set the standard for mathematical proof: start from a few definitions and postulates, then prove every theorem from those and from theorems already proved. That method has survived two thousand years. Modern mathematics has expanded far beyond geometry, but the ideal of rigorous proof from stated axioms remains.",
    "The mathematicians below represent different ages and different fields—from pure geometry to the infinities of Cantor, from Newton and Leibniz's new calculus to Emmy Noether's algebra. Each changed what counted as a mathematical question.",
  ],
  topics: mathematicsTopics,
  figures: [
    {
      slug: "euclid",
      name: "Euclid",
      born: "c. 325",
      died: "c. 265",
      field: ["Geometry", "Mathematics"],
      contributions: [
        "Compiled existing geometric knowledge into the Elements, thirteen books that defined mathematical proof for over two thousand years.",
        "His systematic approach—starting from definitions and a few postulates, then proving every theorem—became the template for all rigorous mathematics.",
        "The fifth postulate on parallel lines was so problematic that attempts to prove it led eventually to non-Euclidean geometries and Riemann's curved spaces.",
      ],
      quotes: [
        {
          text: "The laws of nature are but the mathematical thoughts of God.",
          source: "Attributed",
          verified: false,
          caveat: "This quotation is often attributed to Euclid or Plato but cannot be verified.",
        },
      ],
    },
    {
      slug: "archimedes",
      name: "Archimedes",
      born: "287",
      died: "212",
      field: ["Mathematics", "Physics", "Engineering"],
      contributions: [
        "Calculated the area under a parabola by summing infinite series of rectangles—a method that anticipated integral calculus two thousand years early.",
        "Proved that the volume of a sphere is two-thirds the volume of the cylinder that surrounds it, and asked to have this theorem inscribed on his tombstone.",
        "Wrote on the equilibrium of floating bodies, founding hydrostatics, and designed mechanical devices for warfare and engineering.",
      ],
      quotes: [
        {
          text: "Give me a lever long enough and a fulcrum on which to place it, and I shall move the world.",
          source: "Quoted in Pappus of Alexandria's Mathematical Collection",
          verified: true,
          caveat: "The exact wording varies across sources, but the idea is consistently attributed to Archimedes.",
        },
      ],
    },
    {
      slug: "isaac-newton",
      name: "Isaac Newton",
      born: "1643",
      died: "1727",
      field: ["Mathematics", "Physics", "Optics"],
      contributions: [
        "Discovered the calculus independently of Leibniz in the mid-1660s, using a notation of 'fluxions' and 'fluents' that was harder to work with than Leibniz's legacy.",
        "Wrote the Principia Mathematica (1687), which derived the laws of motion and gravity from first principles and showed how they explain planetary orbits and terrestrial mechanics.",
        "Developed the binomial series and worked in optics, demonstrating that white light is composed of different colours.",
      ],
      quotes: [
        {
          text: "If I have seen further, it is by standing on the shoulders of giants.",
          source: "Letter to Robert Hooke, 1675",
          verified: true,
        },
      ],
    },
    {
      slug: "leonhard-euler",
      name: "Leonhard Euler",
      born: "1707",
      died: "1783",
      field: ["Mathematics", "Physics"],
      contributions: [
        "One of the most prolific mathematicians ever. Wrote over 900 papers on topics ranging from combinatorics to topology to number theory.",
        "Introduced much modern notation including the summation symbol Σ and the number e, the base of natural logarithms.",
        "Solved the Seven Bridges of Königsberg problem in 1736, founding the field of graph theory and anticipating topology.",
      ],
      quotes: [
        {
          text: "Read Euler, read Euler. He is the master of us all.",
          source: "Attributed to Pierre-Simon Laplace",
          verified: false,
        },
      ],
    },
    {
      slug: "carl-friedrich-gauss",
      name: "Carl Friedrich Gauss",
      born: "1777",
      died: "1855",
      field: ["Mathematics", "Physics", "Astronomy"],
      contributions: [
        "Proved the fundamental theorem of algebra: every polynomial of degree n has exactly n complex roots (counting multiplicities).",
        "Developed the method of least squares for fitting curves to data, a cornerstone of statistics and numerical analysis.",
        "Made major contributions to number theory, including the prime number theorem and the distribution of primes.",
      ],
      quotes: [
        {
          text: "Mathematics is the queen of the sciences.",
          source: "Attributed",
          verified: false,
        },
      ],
    },
    {
      slug: "georg-cantor",
      name: "Georg Cantor",
      born: "1845",
      died: "1918",
      field: ["Mathematics"],
      contributions: [
        "Created set theory, the foundation of modern mathematics. Showed how to compare the sizes of infinite sets using one-to-one correspondence.",
        "Proved that some infinities are larger than others: the real numbers are a larger infinity than the counting numbers, even though both are endless.",
        "Faced fierce opposition from contemporaries who saw his ideas as not 'real' mathematics, but his work became central to all of modern mathematics by the twentieth century.",
      ],
      quotes: [
        {
          text: "A new species of mathematics is necessary for the investigation of variable phenomena.",
          source: "Grundlagen einer allgemeinen Mannigfaltigkeitslehre (1883)",
          verified: true,
          caveat: "Translation from German.",
        },
      ],
    },
    {
      slug: "david-hilbert",
      name: "David Hilbert",
      born: "1862",
      died: "1943",
      field: ["Mathematics"],
      contributions: [
        "At the 1900 International Congress of Mathematicians, posed 23 unsolved problems that shaped mathematics for the next century.",
        "Made major contributions to algebra, number theory, functional analysis and mathematical logic.",
        "Advocated for formalism: the idea that mathematics is about manipulating symbols according to rules, unconcerned with what the symbols 'mean'.",
      ],
      quotes: [
        {
          text: "No one shall expel us from the paradise which Cantor has created.",
          source: "Quoted in various forms, from Hilbert's defense of set theory",
          verified: true,
          caveat: "Exact wording varies; this expresses Hilbert's support for Cantor's work.",
        },
      ],
    },
    {
      slug: "emmy-noether",
      name: "Emmy Noether",
      born: "1882",
      died: "1935",
      field: ["Mathematics", "Physics"],
      contributions: [
        "Proved Noether's theorem (1918): every continuous symmetry of a physical system's action gives a conserved quantity. Symmetry in time yields conservation of energy, symmetry in space yields momentum.",
        "Made fundamental contributions to abstract algebra and ring theory, reshaping algebra as the study of abstract structures rather than equations.",
        "Faced barriers as a woman in mathematics but became widely recognised as one of the greatest mathematicians of her era.",
      ],
      quotes: [
        {
          text: "I would very much like to obtain a docent position, so I could have a little financial security.",
          source: "Letter expressing career difficulties",
          verified: true,
          caveat: "Despite her brilliance, Noether struggled to find academic positions in 1920s Germany.",
        },
      ],
    },
  ],
};
