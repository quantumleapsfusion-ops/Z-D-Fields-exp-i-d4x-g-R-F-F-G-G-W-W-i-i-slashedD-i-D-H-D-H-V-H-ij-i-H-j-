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
      slug: "thomas-hobbes",
      name: "Thomas Hobbes",
      born: "1588",
      died: "1679",
      field: ["Philosophy", "Political theory"],
      contributions: [
        "Argued in Leviathan (1651) that people in a 'state of nature' have equal capacity to harm each other, forcing them into an implicit contract with others.",
        "Showed that human equality, not inequality, is the foundation for needing rules. Any rule for Earth or space must account for this.",
      ],
      quotes: [
        {
          text: "Nature hath made men so equal, in the faculties of body and mind, as that though there be found one man sometimes manifestly stronger in body or of quicker mind than another, yet when all is reckoned together the difference between man and man is not so considerable.",
          source: "Leviathan, Part I, Chapter 13",
          verified: true,
        },
      ],
    },
    {
      slug: "baruch-spinoza",
      name: "Baruch Spinoza",
      born: "1632",
      died: "1677",
      field: ["Philosophy", "Ethics"],
      contributions: [
        "Rejected dualism between mind and body, God and nature, proposing instead that all things are expressions of one substance.",
        "This metaphysical view undoes the separation between 'us' and 'them': all beings share the same fundamental nature.",
      ],
      quotes: [
        {
          text: "All things, in so far as they are considered in relation to one another, are all of the same nature.",
          source: "Paraphrase of Ethics, Part I, Proposition 1",
          verified: false,
          caveat: "Paraphrased from Spinoza's monism. See Ethics, Parts I–II.",
        },
      ],
    },
    {
      slug: "bertrand-russell",
      name: "Bertrand Russell",
      born: "1872",
      died: "1970",
      field: ["Philosophy", "Mathematics", "Peace advocacy"],
      contributions: [
        "Argued that human beings have a common stake in survival and that nationalism is a barrier to cooperation.",
        "In the nuclear age, he saw global citizenship as a practical necessity: either the world coordinates, or everyone dies.",
      ],
      quotes: [
        {
          text: "The fundamental cause of trouble in the world today is that the stupid are cocksure while the intelligent are full of doubt.",
          source: "Quoted in multiple sources, popularized mid-20th century",
          verified: false,
          caveat: "Often attributed to Russell; original source unverified.",
        },
      ],
    },
    {
      slug: "ludwig-wittgenstein",
      name: "Ludwig Wittgenstein",
      born: "1889",
      died: "1951",
      field: ["Philosophy", "Logic", "Language"],
      contributions: [
        "Showed that many philosophical problems arise from misuse of language and confusion about how words mean.",
        "This insight applies to political thought: arguments about 'national interest' vs. 'global good' often turn on how those words are used.",
      ],
      quotes: [
        {
          text: "Whereof one cannot speak, thereof one must be silent.",
          source: "Tractatus Logico-Philosophicus (1921), 7",
          verified: true,
          caveat: "Translation by C. K. Ogden, 1922.",
        },
      ],
    },
    {
      slug: "peter-singer",
      name: "Peter Singer",
      born: "1946",
      died: "",
      field: ["Philosophy", "Ethics"],
      contributions: [
        "Argued that ethical obligations are not bounded by national borders: if you can prevent suffering at no comparable cost, you ought to, whether the suffering is near or far.",
        "Showed that our sense of local obligation and global obligation can be placed on a continuum—one principle covers both.",
      ],
      quotes: [
        {
          text: "The capacity for suffering and enjoyment is a prerequisite for having interests, a condition that must be satisfied before we can speak of interests in any meaningful way.",
          source: "Animal Liberation (1975), chapter 1",
          verified: true,
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
    {
      slug: "john-von-neumann",
      name: "John von Neumann",
      born: "1903",
      died: "1957",
      field: ["Mathematics", "Computing", "Physics"],
      contributions: [
        "Pioneer of computer science and game theory, showed that complex systems could be analyzed mathematically.",
        "Worked on the hydrogen bomb but later warned that nuclear weapons made global coordination unavoidable: nations could no longer act in isolation.",
      ],
      quotes: [
        {
          text: "The sciences do not try to explain nature. They interact with nature, and the real output of science is not understanding by itself, but understanding plus power.",
          source: "The Physicist Looks at Society (1956)",
          verified: false,
          caveat: "Approximate quote; exact wording varies in sources.",
        },
      ],
    },
    {
      slug: "alan-turing",
      name: "Alan Turing",
      born: "1912",
      died: "1954",
      field: ["Mathematics", "Computing", "Logic"],
      contributions: [
        "Founder of computer science and artificial intelligence; created the Turing Test asking whether machines could think.",
        "Showed that computation was universal: any problem solvable by one machine could be solved by any other, a principle that makes global communication possible.",
      ],
      quotes: [
        {
          text: "I believe that at the end of the century the use of words and general educated opinion will have altered so much that one will be able to speak of machines thinking without expecting to be contradicted.",
          source: "Computing Machinery and Intelligence (1950)",
          verified: true,
        },
      ],
    },
    {
      slug: "claude-shannon",
      name: "Claude Shannon",
      born: "1916",
      died: "2001",
      field: ["Mathematics", "Information theory"],
      contributions: [
        "Founder of information theory; proved that any message could be reliably transmitted across noisy channels using error correction.",
        "His work made possible the global communications networks—telephone, radio, internet—that connect humanity.",
      ],
      quotes: [
        {
          text: "Information is the resolution of uncertainty.",
          source: "A Mathematical Theory of Communication (1948)",
          verified: true,
        },
      ],
    },
    {
      slug: "j-robert-oppenheimer",
      name: "J. Robert Oppenheimer",
      born: "1904",
      died: "1967",
      field: ["Physics", "Leadership"],
      contributions: [
        "Led the Manhattan Project to build the atomic bomb; later became the voice of nuclear scientists' responsibility to humanity.",
        "Argued that the bomb had made war between great powers irrational: survival now required global cooperation.",
      ],
      quotes: [
        {
          text: "Now I am become Death, the destroyer of worlds.",
          source: "Quoted from the Bhagavad Gita, speaking after the first atomic bomb test (Trinity), July 1945",
          verified: true,
          caveat: "His paraphrase of the Gita; reflects his later remorse about weapons development.",
        },
      ],
    },
    {
      slug: "karl-popper",
      name: "Karl Popper",
      born: "1902",
      died: "1994",
      field: ["Philosophy", "Political theory"],
      contributions: [
        "Argued for 'open society': a political system where ideas compete and citizens can critique power without fear.",
        "Showed that totalitarianism—whether communist or fascist—arises when one group claims final truth; global peace requires openness to revision.",
      ],
      quotes: [
        {
          text: "The open society is one in which men are free to discuss their differences openly and where conflicts are settled by argument rather than by violence.",
          source: "The Open Society and Its Enemies (1945)",
          verified: true,
        },
      ],
    },
    {
      slug: "nassim-taleb",
      name: "Nassim Taleb",
      born: "1960",
      died: "",
      field: ["Philosophy", "Risk management"],
      contributions: [
        "Argued that global systems are fragile to rare, extreme events ('black swans') that standard risk models miss.",
        "Showed that tightly connected global networks can amplify small shocks into systemic crises; resilience requires redundancy and diversity.",
      ],
      quotes: [
        {
          text: "The inability to predict outliers implies the inability to predict the course of history.",
          source: "The Black Swan (2007)",
          verified: true,
        },
      ],
    },
    {
      slug: "mark-zuckerberg",
      name: "Mark Zuckerberg",
      born: "1984",
      died: "",
      field: ["Technology", "Internet platforms"],
      contributions: [
        "Built Facebook with the stated mission of connecting people across borders and making the world more open and connected.",
        "Demonstrated that technology platforms can reach billions and shape how humanity communicates, for better and worse.",
      ],
      quotes: [
        {
          text: "The biggest challenge we face is that most of the problems we face are global in nature, but our institutions are national.",
          source: "Facebook post and public statements, 2016–2017",
          verified: false,
          caveat: "Paraphrased from multiple public statements; exact wording varies.",
        },
      ],
    },
  ],
  sub: [
    {
      id: "science-fiction",
      title: "In science fiction",
    intro: [
      "Science fiction is where people have rehearsed what governing a crowded galaxy might feel like, or what happens when technology upends the power structures that nations depend on.",
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
      {
        slug: "ursula-k-le-guin",
        name: "Ursula K. Le Guin",
        born: "1929",
        died: "2018",
        field: ["Science fiction", "Fantasy"],
        contributions: [
          "In The Dispossessed (1974) she imagined two worlds: one anarchist, one capitalist, both flawed, each teaching the other something vital.",
          "Her work insists that no single system holds all answers, and that cooperation between different cultures requires honesty about their differences.",
        ],
        quotes: [
          {
            text: "In a society, the individuality of all its members is essential.",
            source: "Paraphrase of The Dispossessed, protagonist's philosophy",
            verified: false,
            caveat: "Paraphrased from Le Guin's themes in The Dispossessed (1974).",
          },
        ],
      },
      {
        slug: "octavia-butler",
        name: "Octavia Butler",
        born: "1947",
        died: "2006",
        field: ["Science fiction"],
        contributions: [
          "The Parable novels (starting 1993) show how societies fragment when they retreat into tribal walls and ignore the larger world. Her vision of survival requires new forms of belonging.",
          "Her work often features characters from marginalized communities solving problems that everyone depends on.",
        ],
        quotes: [
          {
            text: "There is nothing new under the sun, but there are new suns.",
            source: "Often quoted as Butler's philosophy",
            verified: false,
            caveat: "Attributed to Butler's journals and thinking; specific source unverified.",
          },
        ],
      },
      {
        slug: "n-k-jemisin",
        name: "N.K. Jemisin",
        born: "1972",
        died: "",
        field: ["Science fiction", "Fantasy"],
        contributions: [
          "The Broken Earth trilogy (2015–2017) shows a world where power is enforced through oppression of a subordinate group—and what happens when that system destabilizes.",
          "Her work asks: what global order could replace one built on domination?",
        ],
        quotes: [
          {
            text: "But you can't stop yourself, can you? That's what it means to be a people. What it means to have power.",
            source: "Paraphrase of Broken Earth trilogy themes",
            verified: false,
            caveat: "Paraphrased from themes in The Fifth Season (2015) and sequels.",
          },
        ],
      },
    ],
    },
    {
    id: "planetary-architects",
    title: "Planetary architects: multiplanetary civilization",
    intro: [
      "The transition from a single-planet to a multiplanetary species raises the deepest question of global citizenship: what is humanity's obligation to itself, and to worlds we have yet to reach? Two contemporary thinkers—one building the technologies, one chronicling visionaries—argue that survival and flourishing require thinking across planetary scales.",
    ],
    figures: [
      {
        slug: "elon-musk",
        name: "Elon Musk",
        born: "1971",
        died: "",
        field: ["Engineering", "Space exploration", "Technology"],
        contributions: [
          "Founded SpaceX with the goal of making humanity multiplanetary; argues that becoming a multiplanetary species is essential for the long-term survival of human civilization.",
          "Advocates for first-principles thinking: break problems down to physical laws rather than analogy, a method he applies to energy, transportation, and space.",
        ],
        quotes: [
          {
            text: "I think there is a strong humanitarian argument for making life multiplanetary in order to safeguard the existence of humanity in the event that something catastrophic were to happen.",
            source: "TED Talk and interviews, 2005–present",
            verified: false,
            caveat: "Paraphrased from multiple interviews; exact wording varies.",
          },
          {
            text: "The first principles approach involves looking at a situation and taking the relevant facts as an input and reasoning from there. This is how science works.",
            source: "Quoted in interviews on methodology",
            verified: false,
            caveat: "Loosely sourced; reflects his consistent philosophy.",
          },
        ],
      },
      {
        slug: "walter-isaacson",
        name: "Walter Isaacson",
        born: "1952",
        died: "",
        field: ["Biography", "History", "Journalism"],
        contributions: [
          "Biographer of visionaries including Einstein, Steve Jobs, Benjamin Franklin, and Leonardo da Vinci; his work shows how individual genius shapes epochs.",
          "Wrote the biography of Elon Musk (2023), chronicling how one person's conviction about humanity's future on multiple planets shapes technology and society.",
        ],
        quotes: [
          {
            text: "The most creative people are willing to start from first principles and think in new ways. They see interconnections across disciplines.",
            source: "From interviews on his biographical work",
            verified: false,
            caveat: "Paraphrased from Isaacson's commentary on visionaries he has studied.",
          },
        ],
      },
    ],
    },
  ],
};
