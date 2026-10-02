import type { FieldSection } from "./types";

export const globalCitizenship: FieldSection = {
  slug: "global-citizenship",
  title: "Global Citizenship",
  line: "Every person on Earth is a citizen of it.",
  intro: [
    "Kant's argument for world citizenship starts from geography: the Earth is a sphere, so people cannot scatter forever and must learn to share it. The solar system is larger, but it is finite too. The 1967 Outer Space Treaty already says that the Moon and other bodies are not subject to national appropriation by any claim of sovereignty. If people settle Mars or the asteroid belt, they will need shared rules that no single nation writes alone.",
    "None of the philosophers below wrote about space. We include them because each said something precise about belonging to humanity rather than to one state, and those arguments are the starting point for coordinating anything beyond Earth. Where a famous line could not be traced to its source, it is left out.",
  ],
  figures: [
    {
      slug: "augustine-of-hippo",
      name: "Augustine of Hippo",
      born: "354",
      died: "430",
      field: ["Philosophy", "Theology"],
      contributions: [
        "In The City of God he set an earthly city, bound by local loyalties, against a heavenly city whose members come from every nation and language.",
        "Gave Western thought the idea that a person's deepest citizenship need not match the state they live in.",
      ],
      quotes: [
        {
          text: "This heavenly city, then, while it sojourns on earth, calls citizens out of all nations, and gathers together a society of pilgrims of all languages.",
          source: "The City of God, Book XIX, chapter 17",
          verified: true,
          caveat: "Translation by Marcus Dods, 1871.",
        },
      ],
    },
    {
      slug: "john-locke",
      name: "John Locke",
      born: "1632",
      died: "1704",
      field: ["Philosophy", "Political theory"],
      contributions: [
        "Argued in the Second Treatise of Government (1689) that people have natural rights to life, liberty and property before any government exists.",
        "Held that the Earth was given to humankind in common, a premise any rule for dividing new land, on Earth or off it, has to answer.",
      ],
      quotes: [
        {
          text: "Being all equal and independent, no one ought to harm another in his life, health, liberty, or possessions.",
          source: "Second Treatise of Government (1689), §6",
          verified: true,
        },
        {
          text: "God, who hath given the world to men in common, hath also given them reason to make use of it to the best advantage of life, and convenience.",
          source: "Second Treatise of Government (1689), §26",
          verified: true,
        },
      ],
    },
    {
      slug: "david-hume",
      name: "David Hume",
      born: "1711",
      died: "1776",
      field: ["Philosophy", "Economics", "History"],
      contributions: [
        "Argued that trade between nations is not a contest: a neighbour's prosperity enriches you rather than threatening you.",
        "Grounded morality in sympathy, a feeling that can reach beyond family and nation.",
      ],
      quotes: [
        {
          text: "I shall therefore venture to acknowledge, that, not only as a man, but as a British subject, I pray for the flourishing commerce of Germany, Spain, Italy, and even France itself.",
          source: "Of the Jealousy of Trade (1758)",
          verified: true,
        },
      ],
    },
    {
      slug: "jean-jacques-rousseau",
      name: "Jean-Jacques Rousseau",
      born: "1712",
      died: "1778",
      field: ["Philosophy", "Political theory"],
      contributions: [
        "Built political legitimacy on the general will of citizens in The Social Contract (1762).",
        "Was sceptical of cosmopolitanism, warning that love of humanity in the abstract can excuse neglect of the people next door. Any honest case for global citizenship has to answer him.",
      ],
      quotes: [
        {
          text: "Distrust those cosmopolitans who search out remote duties in their books and neglect those that lie nearest. Such a philosopher loves the Tartars in order to be dispensed from loving his neighbours.",
          source: "Émile, or On Education (1762), Book I",
          verified: true,
          caveat:
            "Translation by Barbara Foxley, 1911. Wording varies between translations.",
        },
      ],
    },
    {
      slug: "immanuel-kant",
      name: "Immanuel Kant",
      born: "1724",
      died: "1804",
      field: ["Philosophy"],
      contributions: [
        "Proposed in Perpetual Peace (1795) a federation of free states and a 'cosmopolitan right': every person may visit any part of the Earth without being treated as an enemy.",
        "Rested that right on the shape of the planet: a finite surface that people must share.",
      ],
      quotes: [
        {
          text: "The peoples of the earth have thus entered in varying degrees into a universal community, and it has developed to the point where a violation of rights in one part of the world is felt everywhere.",
          source: "Perpetual Peace (1795), Third Definitive Article",
          verified: true,
          caveat:
            "Translation by H. B. Nisbet, in Kant: Political Writings (Cambridge, 1991).",
        },
      ],
    },
    {
      slug: "g-w-f-hegel",
      name: "G. W. F. Hegel",
      born: "1770",
      died: "1831",
      field: ["Philosophy"],
      contributions: [
        "Saw history as the growth of freedom, from one person free to some to all.",
        "Placed the state at the centre of ethical life, yet insisted that a person's standing as a human being comes before any religion or nationality.",
      ],
      quotes: [
        {
          text: "A man counts as a man in virtue of his manhood alone, not because he is a Jew, Catholic, Protestant, German, Italian, etc.",
          source: "Elements of the Philosophy of Right (1820), §209, Remark",
          verified: true,
          caveat: "Translation by T. M. Knox, 1952. 'Man' here means any human being.",
        },
      ],
    },
    {
      slug: "michel-foucault",
      name: "Michel Foucault",
      born: "1926",
      died: "1984",
      field: ["Philosophy", "History"],
      contributions: [
        "Traced how institutions such as prisons, clinics and schools shape the people inside them.",
        "In 1981, speaking for refugees fleeing Vietnam by boat, he claimed rights for people that belong to no government's gift.",
      ],
      quotes: [
        {
          text: "There exists an international citizenship that has its rights and its duties, and that obliges one to speak out against every abuse of power, whoever its author, whoever its victims.",
          source:
            '"Confronting Governments: Human Rights", statement in Geneva, June 1981',
          verified: true,
          caveat:
            "Published in Libération, 30 June – 1 July 1984. Translation by Robert Hurley.",
        },
      ],
    },
  ],
  sub: {
    id: "science-fiction",
    title: "In science fiction",
    intro: [
      "Science fiction is where people have rehearsed what governing a crowded galaxy might feel like. Two writers who did it with clear eyes:",
    ],
    figures: [
      {
        slug: "isaac-asimov",
        name: "Isaac Asimov",
        born: "1920",
        died: "1992",
        field: ["Science fiction", "Science writing"],
        contributions: [
          "The Foundation stories imagine a Galactic Empire in decline and a plan to shorten the dark age after it, a meditation on whether whole civilisations can be steered.",
          "Wrote or edited around five hundred books, many of them explaining science to the public.",
        ],
        quotes: [
          {
            text: "Violence is the last refuge of the incompetent.",
            source: "Foundation (1951)",
            verified: true,
            caveat: "Spoken by the character Salvor Hardin.",
          },
          {
            text: "The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.",
            source: "",
            verified: false,
            caveat:
              "Usually credited to Isaac Asimov's Book of Science and Nature Quotations (1988); we have not checked the page.",
          },
        ],
      },
      {
        slug: "douglas-adams",
        name: "Douglas Adams",
        born: "1952",
        died: "2001",
        field: ["Science fiction", "Comedy"],
        contributions: [
          "The Hitchhiker's Guide to the Galaxy (radio 1978, novel 1979) begins with Earth demolished for a bypass, after the plans sat on display on a planet nobody from Earth could reach. It is still the best satire of remote bureaucracy deciding local fates.",
        ],
        quotes: [
          {
            text: "Space is big. Really big. You just won't believe how vastly hugely mindbogglingly big it is.",
            source: "The Hitchhiker's Guide to the Galaxy (1979), chapter 8",
            verified: true,
          },
        ],
      },
    ],
  },
};
