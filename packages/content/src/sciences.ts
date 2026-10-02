import { mathematicsTopics, physicsTopics } from "./topics";
import type { FieldSection } from "./types";

export const physics: FieldSection = {
  slug: "physics",
  title: "Physics",
  line: "The same laws hold on every shore.",
  intro: [
    "Physics asks what the world is made of and how it moves, and answers in rules that work the same in Lagos, Lima and on the Moon. Its two deepest chapters on this site have pages of their own: quantum mechanics and quantum computing. This page holds the people who built the classical ground those chapters stand on.",
  ],
  topics: physicsTopics,
  figures: [
    {
      slug: "galileo-galilei",
      name: "Galileo Galilei",
      born: "1564",
      died: "1642",
      field: ["Physics", "Astronomy"],
      contributions: [
        "Measured how bodies fall and roll, and found that, without air resistance, all fall with the same acceleration.",
        "Turned an improved telescope on the sky in 1609–10 and found Jupiter's moons, the phases of Venus and the craters of the Moon.",
        "Insisted that experiment and mathematics, not authority, settle questions about nature, and was tried by the Roman Inquisition in 1633 for defending Copernicus.",
      ],
      quotes: [
        {
          text: "It is written in the language of mathematics, and its characters are triangles, circles, and other geometric figures, without which it is humanly impossible to understand a single word of it.",
          source: "Il Saggiatore (The Assayer), 1623",
          verified: true,
          caveat:
            "Galileo is speaking of the universe, the 'grand book' of philosophy. Translation by Stillman Drake.",
        },
        {
          text: "Eppur si muove (And yet it moves).",
          source: "",
          verified: false,
          caveat:
            "First printed by Giuseppe Baretti in 1757, more than a century after the trial. No contemporary record.",
        },
      ],
    },
    {
      slug: "isaac-newton",
      name: "Isaac Newton",
      born: "1643",
      died: "1727",
      field: ["Physics", "Mathematics", "Optics"],
      contributions: [
        "Stated three laws of motion and the law of universal gravitation in the Principia (1687), explaining falling apples and planetary orbits with one rule.",
        "Developed calculus, independently of Leibniz.",
        "Split white light with a prism and showed it is a mixture of colours.",
      ],
      quotes: [
        {
          text: "If I have seen further it is by standing on the shoulders of Giants.",
          source: "Letter to Robert Hooke, 5 February 1675/76",
          verified: true,
        },
      ],
    },
    {
      slug: "michael-faraday",
      name: "Michael Faraday",
      born: "1791",
      died: "1867",
      field: ["Physics", "Chemistry"],
      contributions: [
        "Discovered electromagnetic induction in 1831: a changing magnetic field makes an electric current. Every generator and transformer runs on it.",
        "Pictured electric and magnetic forces as lines of force filling space, the idea that became the field.",
        "Left school at fourteen and taught himself science while apprenticed to a bookbinder.",
      ],
      quotes: [
        {
          text: "Nothing is too wonderful to be true, if it be consistent with the laws of nature.",
          source: "Laboratory diary, entry of 19 March 1849",
          verified: true,
        },
      ],
    },
    {
      slug: "james-clerk-maxwell",
      name: "James Clerk Maxwell",
      born: "1831",
      died: "1879",
      field: ["Physics"],
      contributions: [
        "Wrote the equations that unify electricity, magnetism and light, and predicted electromagnetic waves travelling at the speed of light.",
        "Founded the statistical description of gases with the Maxwell distribution of molecular speeds.",
        "Took one of the first colour photographs, in 1861.",
      ],
      quotes: [
        {
          text: "We can scarcely avoid the inference that light consists in the transverse undulations of the same medium which is the cause of electric and magnetic phenomena.",
          source: "On Physical Lines of Force, Part III, Philosophical Magazine, 1862",
          verified: true,
        },
      ],
    },
    {
      slug: "lise-meitner",
      name: "Lise Meitner",
      born: "1878",
      died: "1968",
      field: ["Physics"],
      contributions: [
        "With her nephew Otto Frisch, gave the first physical explanation of nuclear fission in 1939, from exile in Sweden after fleeing Nazi Germany.",
        "Worked for three decades with Otto Hahn, who alone received the 1944 Nobel Prize in Chemistry for fission.",
        "Element 109, meitnerium, is named after her.",
      ],
      quotes: [],
    },
    {
      slug: "pierre-curie",
      name: "Pierre Curie",
      born: "1859",
      died: "1906",
      field: ["Physics", "Chemistry"],
      contributions: [
        "With Marie, discovered the phenomenon of radioactivity in 1898, showing it was an atomic property independent of chemistry, and developed systematic methods to measure it quantitatively.",
        "Won the Nobel Prize in Physics in 1903 (shared with Marie and Becquerel) for the discovery of spontaneous radioactivity.",
        "Discovered the unit of radioactivity, the Curie, now named after him: the activity of one gram of radium-226.",
        "Worked on crystal symmetry and piezoelectricity (the generation of electricity by mechanical stress), discoveries that were foundational to later solid-state physics.",
        "Died in a street accident in Paris when a wagon struck him; the year 1906 was critical as it came just before quantum mechanics would explain what radioactivity is.",
      ],
      quotes: [
        {
          text: "Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves.",
          source: "",
          verified: false,
          caveat: "Widely attributed but the source is unclear.",
        },
      ],
    },
    {
      slug: "wilhelm-rontgen",
      name: "Wilhelm Röntgen",
      born: "1845",
      died: "1923",
      field: ["Physics"],
      contributions: [
        "Discovered X-rays on 8 November 1895 while experimenting with cathode rays at the University of Würzburg. He found a glow from a fluorescent screen across the room, and showed that a mysterious radiation passed through paper and flesh but not bone.",
        "Won the first Nobel Prize in Physics in 1901 for this discovery.",
        "Called them X-rays because their nature was unknown. They turned out to be electromagnetic radiation of very short wavelength, like light but billions of times more energetic.",
      ],
      quotes: [
        {
          text: "I have discovered something interesting.",
          source: "",
          verified: false,
          caveat: "Röntgen's reported words to his wife on the discovery. The source is unclear.",
        },
      ],
    },
    {
      slug: "ernest-rutherford",
      name: "Ernest Rutherford",
      born: "1871",
      died: "1937",
      field: ["Physics"],
      contributions: [
        "In 1909 devised the scattering experiment that revealed the nuclear structure of the atom: most of an atom is empty space, with a tiny positive nucleus at its centre.",
        "Discovered and named alpha and beta radiation as two forms of radioactive decay, and showed they were nuclear processes.",
        "First person to induce a nuclear reaction in the laboratory, in 1919, splitting the nitrogen nucleus.",
        "Mentored eleven future Nobel laureates, more than any scientist of his era.",
      ],
      quotes: [
        {
          text: "If your experiment needs statistics, you ought to do a better experiment.",
          source: "",
          verified: false,
          caveat: "Widely attributed but likely misquoted or paraphrased.",
        },
      ],
    },
    {
      slug: "robert-oppenheimer",
      name: "J. Robert Oppenheimer",
      born: "1904",
      died: "1967",
      field: ["Physics"],
      contributions: [
        "Directed the Los Alamos Laboratory from 1942 to 1945, assembling a laboratory of 4,000 scientists to design and build the first atomic bombs as part of the Manhattan Project.",
        "On 16 July 1945 at the Trinity test in New Mexico, the first nuclear device was detonated, releasing energy equivalent to thousands of tons of TNT and beginning the nuclear age.",
        "Days later, atomic bombs were dropped on Hiroshima (6 August) and Nagasaki (9 August), killing about 200,000 people and leading to Japan's surrender, ending the Second World War.",
        "After the war, opposed further nuclear weapons development and the arms race. In 1954, the Eisenhower administration withdrew his security clearance during the McCarthy era for his political views and early doubts about the hydrogen bomb.",
      ],
      quotes: [
        {
          text: "Now I am become Death, the destroyer of worlds.",
          source: "Recollection of the Trinity test in an interview",
          verified: false,
          caveat: "Oppenheimer gave different accounts of his thoughts at Trinity. This quote, drawn from the Bhagavad Gita, may reflect his interpretation in retrospect rather than his exact words at the time.",
        },
      ],
    },
  ],
};

export const chemistry: FieldSection = {
  slug: "chemistry",
  title: "Chemistry",
  line: "Everything you can touch, rearranged.",
  intro: [
    "Chemistry is the study of what happens when atoms trade partners. It feeds the world through fertiliser, heals it through medicine, and explains why iron rusts and bread rises. Its laws are quantum mechanics in practice.",
  ],
  figures: [
    {
      slug: "antoine-lavoisier",
      name: "Antoine Lavoisier",
      born: "1743",
      died: "1794",
      field: ["Chemistry"],
      contributions: [
        "Showed by careful weighing that mass is conserved in chemical reactions.",
        "Named oxygen and hydrogen and explained combustion as combination with oxygen, ending the phlogiston theory.",
        "Co-wrote the system of chemical names still used today. He was guillotined in the Terror in 1794.",
      ],
      quotes: [
        {
          text: "We may lay it down as an incontestible axiom, that, in all the operations of art and nature, nothing is created; an equal quantity of matter exists both before and after the experiment.",
          source: "Elements of Chemistry, Part I, chapter XIII (1789)",
          verified: true,
          caveat:
            "From the Traité élémentaire de chimie; English translation by Robert Kerr, 1790.",
        },
        {
          text: "Rien ne se perd, rien ne se crée, tout se transforme.",
          source: "",
          verified: false,
          caveat:
            "A later popular paraphrase of the line above, not Lavoisier's wording.",
        },
      ],
    },
    {
      slug: "john-dalton",
      name: "John Dalton",
      born: "1766",
      died: "1844",
      field: ["Chemistry", "Physics"],
      contributions: [
        "Proposed that each element is made of identical atoms with a characteristic weight, and that compounds form in fixed whole-number ratios.",
        "Gave the first scientific description of colour blindness, which he had himself.",
      ],
      quotes: [],
    },
    {
      slug: "dmitri-mendeleev",
      name: "Dmitri Mendeleev",
      born: "1834",
      died: "1907",
      field: ["Chemistry"],
      contributions: [
        "Arranged the elements by atomic weight and chemical behaviour into the periodic table in 1869.",
        "Left gaps for elements nobody had found and predicted their properties; gallium, scandium and germanium arrived within seventeen years and matched.",
      ],
      quotes: [],
    },
    {
      slug: "marie-curie",
      name: "Marie Skłodowska-Curie",
      born: "1867",
      died: "1934",
      field: ["Chemistry", "Physics"],
      contributions: [
        "Discovered polonium and radium with Pierre Curie, and coined the word 'radioactivity'.",
        "First person to win two Nobel Prizes, and still the only one in two different sciences: physics in 1903, chemistry in 1911.",
        "Ran mobile X-ray units on the front lines of the First World War.",
      ],
      quotes: [
        {
          text: "Nothing in life is to be feared, it is only to be understood.",
          source: "",
          verified: false,
          caveat: "Widely attributed; we have not found it in her writing.",
        },
      ],
    },
    {
      slug: "linus-pauling",
      name: "Linus Pauling",
      born: "1901",
      died: "1994",
      field: ["Chemistry", "Biology"],
      contributions: [
        "Explained the chemical bond with quantum mechanics in The Nature of the Chemical Bond (1939).",
        "Found the alpha helix in proteins and the molecular cause of sickle-cell anaemia.",
        "Won the Nobel Prize in Chemistry (1954) and the Nobel Peace Prize (1962), the latter for campaigning against nuclear testing.",
      ],
      quotes: [
        {
          text: "The best way to have a good idea is to have lots of ideas.",
          source: "",
          verified: false,
          caveat: "Reported by others; no primary source found.",
        },
      ],
    },
    {
      slug: "dorothy-hodgkin",
      name: "Dorothy Crowfoot Hodgkin",
      born: "1910",
      died: "1994",
      field: ["Chemistry"],
      contributions: [
        "Used X-ray crystallography to solve the structures of penicillin (1945), vitamin B12 (1954) and insulin (1969).",
        "Won the Nobel Prize in Chemistry in 1964.",
      ],
      quotes: [],
    },
  ],
};

export const biology: FieldSection = {
  slug: "biology",
  title: "Biology",
  line: "One family tree, four billion years deep.",
  intro: [
    "Every living thing on Earth reads the same genetic code and descends from common ancestors. Biology is the study of how that one inheritance became bacteria, oak trees and the people reading this page.",
  ],
  figures: [
    {
      slug: "charles-darwin",
      name: "Charles Darwin",
      born: "1809",
      died: "1882",
      field: ["Biology", "Geology"],
      contributions: [
        "Spent five years on the voyage of HMS Beagle collecting the evidence that shaped his thinking.",
        "Explained the diversity of life by natural selection in On the Origin of Species (1859); Alfred Russel Wallace reached the same idea independently.",
      ],
      quotes: [
        {
          text: "There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one; and that, whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.",
          source: "On the Origin of Species, first edition (1859), closing paragraph",
          verified: true,
          caveat: "Later editions add 'by the Creator' after 'breathed'.",
        },
      ],
    },
    {
      slug: "gregor-mendel",
      name: "Gregor Mendel",
      born: "1822",
      died: "1884",
      field: ["Biology"],
      contributions: [
        "Bred about ten thousand pea plants in his monastery garden in Brno and found that traits pass on in discrete units in predictable ratios.",
        "Published in 1866; the work was ignored until it was rediscovered in 1900, and it became the basis of genetics.",
      ],
      quotes: [],
    },
    {
      slug: "barbara-mcclintock",
      name: "Barbara McClintock",
      born: "1902",
      died: "1992",
      field: ["Biology"],
      contributions: [
        "Discovered transposons, 'jumping genes', in maize in the 1940s, showing that genomes are not fixed.",
        "Received the Nobel Prize in Physiology or Medicine alone in 1983.",
      ],
      quotes: [],
    },
    {
      slug: "theodosius-dobzhansky",
      name: "Theodosius Dobzhansky",
      born: "1900",
      died: "1975",
      field: ["Biology"],
      contributions: [
        "Joined Mendel's genetics to Darwin's selection in Genetics and the Origin of Species (1937), a founding book of the modern synthesis.",
      ],
      quotes: [
        {
          text: "Nothing in biology makes sense except in the light of evolution.",
          source: "Title of an essay in The American Biology Teacher, March 1973",
          verified: true,
        },
      ],
    },
    {
      slug: "rosalind-franklin",
      name: "Rosalind Franklin",
      born: "1920",
      died: "1958",
      field: ["Biology", "Chemistry"],
      contributions: [
        "Made the X-ray diffraction images of DNA, including Photograph 51, that showed its helical form.",
        "Her data were shown to Watson and Crick without her knowledge and were decisive for their model.",
        "Went on to work out the structure of viruses, including tobacco mosaic virus.",
      ],
      quotes: [],
    },
    {
      slug: "francis-crick",
      name: "Francis Crick",
      born: "1916",
      died: "2004",
      field: ["Biology", "Physics"],
      contributions: [
        "Proposed the double-helix structure of DNA with James Watson in 1953.",
        "Stated the central dogma of molecular biology and helped crack the genetic code.",
      ],
      quotes: [
        {
          text: "It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.",
          source: "Watson and Crick, Nature 171, 737–738, 25 April 1953",
          verified: true,
          caveat: "Written jointly with James Watson.",
        },
      ],
    },
  ],
};

export const mathematics: FieldSection = {
  slug: "mathematics",
  title: "Mathematics",
  line: "The one language every nation already shares.",
  intro: [
    "A proof written in Kolkata is checked in Göttingen and stays true forever. Mathematics is the most international thing people have made, and the language every other science on this site is written in.",
  ],
  topics: mathematicsTopics,
  figures: [
    {
      slug: "gottfried-wilhelm-leibniz",
      name: "Gottfried Wilhelm Leibniz",
      born: "1646",
      died: "1716",
      field: ["Mathematics", "Philosophy"],
      contributions: [
        "Developed the differential and integral calculus independently of Newton and published it first, in 1684 and 1686, with the dy/dx and integral-sign notation still used today.",
        "Described binary arithmetic in 1703 and built the stepped reckoner, a calculating machine that could multiply and divide.",
      ],
      quotes: [],
    },
    {
      slug: "leonhard-euler",
      name: "Leonhard Euler",
      born: "1707",
      died: "1783",
      field: ["Mathematics", "Physics"],
      contributions: [
        "The most prolific mathematician in history; his collected works run past eighty volumes.",
        "Introduced the notation f(x), e, i and Σ, and found the identity linking e, i, π, 1 and 0.",
        "Solved the Königsberg bridge problem in 1736, founding graph theory. He kept working after losing his sight.",
      ],
      quotes: [],
    },
    {
      slug: "carl-friedrich-gauss",
      name: "Carl Friedrich Gauss",
      born: "1777",
      died: "1855",
      field: ["Mathematics", "Physics", "Astronomy"],
      contributions: [
        "Proved that a regular 17-sided polygon can be drawn with ruler and compass, at nineteen.",
        "Founded modern number theory in Disquisitiones Arithmeticae (1801), and developed least squares and the normal distribution.",
        "Recovered the lost dwarf planet Ceres in 1801 by predicting its orbit.",
      ],
      quotes: [
        {
          text: "Mathematics is the queen of the sciences.",
          source:
            "Reported by Wolfgang Sartorius von Waltershausen in Gauss zum Gedächtniss (1856)",
          verified: true,
          caveat:
            "Recorded by a friend after Gauss's death; the German continues 'and arithmetic the queen of mathematics'.",
        },
      ],
    },
    {
      slug: "david-hilbert",
      name: "David Hilbert",
      born: "1862",
      died: "1943",
      field: ["Mathematics", "Physics"],
      contributions: [
        "Set the agenda for twentieth-century mathematics with 23 problems presented in Paris in 1900.",
        "Built the infinite-dimensional spaces that quantum mechanics is written in.",
      ],
      quotes: [
        {
          text: "Wir müssen wissen. Wir werden wissen. (We must know. We will know.)",
          source: "Radio address, Königsberg, 8 September 1930",
          verified: true,
          caveat: "The words are also carved on his gravestone in Göttingen.",
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
        "Proved in 1915 that every symmetry of a physical law gives a conserved quantity: time symmetry gives energy, space symmetry gives momentum.",
        "Reshaped abstract algebra with her work on rings and ideals.",
        "Taught for years at Göttingen without pay or title because she was a woman, and lost her post in 1933 because she was Jewish.",
      ],
      quotes: [],
    },
    {
      slug: "srinivasa-ramanujan",
      name: "Srinivasa Ramanujan",
      born: "1887",
      died: "1920",
      field: ["Mathematics"],
      contributions: [
        "Largely self-taught in India, he wrote to G. H. Hardy in Cambridge in 1913 with pages of results so unlike anything Hardy had seen that Hardy brought him to England.",
        "Produced thousands of identities on partitions, infinite series and modular forms, many proved only decades later.",
      ],
      quotes: [],
    },
    {
      slug: "g-h-hardy",
      name: "G. H. Hardy",
      born: "1877",
      died: "1947",
      field: ["Mathematics"],
      contributions: [
        "Leading figure in analysis and number theory, and Ramanujan's collaborator at Cambridge.",
        "Gave the Hardy–Weinberg principle of population genetics, almost in passing.",
      ],
      quotes: [
        {
          text: "Beauty is the first test: there is no permanent place in the world for ugly mathematics.",
          source: "A Mathematician's Apology (1940), §10",
          verified: true,
        },
      ],
    },
  ],
};
