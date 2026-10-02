import type { FieldSection } from "./types";

export const globalPhilanthropy: FieldSection = {
  slug: "philanthropy",
  title: "Philanthropy",
  line: "Voluntary giving shapes the future we build together.",
  intro: [
    "Philanthropy—the deliberate direction of resources to human flourishing—raises an old question with new urgency: who decides what the future should be? When a single person or foundation shifts billions toward climate, health, or education, they reshape what becomes possible. The philosophers and practitioners below have shaped how we think about giving, its limits, its power, and its relationship to justice.",
    "The modern philanthropic movement began when industrialists like Andrew Carnegie and John D. Rockefeller declared that wealth accumulated in one generation should be deployed for the public good in the next. That principle collides with democracy: how much power should private wealth hold? And what obligations do givers have to those they serve?",
  ],
  figures: [
    {
      slug: "andrew-carnegie",
      name: "Andrew Carnegie",
      born: "1835",
      died: "1919",
      field: ["Business", "Philanthropy"],
      contributions: [
        "Pioneered the 'Gospel of Wealth' argument that the wealthy are trustees of surplus capital, obligated to spend it during their lifetime on institutions that serve the public.",
        "Built 2,509 public libraries worldwide, shaped how modern philanthropy justifies itself as a moral duty rather than charity.",
      ],
      quotes: [
        {
          text: "The man who dies rich dies disgraced.",
          source: "The Gospel of Wealth (1889)",
          verified: true,
        },
        {
          text: "Upon the sacredness of property civilization itself depends—the right to bind what I accumulate by my individual exertion to my own and those I love.",
          source: "The Gospel of Wealth (1889)",
          verified: true,
        },
      ],
    },
    {
      slug: "john-d-rockefeller",
      name: "John D. Rockefeller",
      born: "1839",
      died: "1937",
      field: ["Business", "Philanthropy"],
      contributions: [
        "Created the Rockefeller Foundation (1913), the first major foundation structured as a lasting institution for systematic giving rather than personal charity.",
        "Shaped modern grantmaking: professional evaluation, measurement of impact, and strategic focus on root causes rather than symptoms.",
      ],
      quotes: [
        {
          text: "I believe it is every man's religious duty to get all he can honestly and then to give all he can.",
          source: "Quoted in multiple biographical sources",
          verified: false,
          caveat: "Often attributed to Rockefeller; original source context unclear.",
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
        "Argues that affluent individuals in wealthy nations have a moral obligation to give a significant portion of their income to reduce suffering in poor countries.",
        "Challenged the distinction between killing and letting die: if you can prevent a child drowning in a pond without comparable sacrifice, you must; distant suffering imposes the same duty.",
      ],
      quotes: [
        {
          text: "If it is in our power to prevent something very bad from happening, without thereby sacrificing anything of comparable moral importance, we ought, morally, to do it.",
          source: "Famine, Affluence, and Morality (1972)",
          verified: true,
        },
      ],
    },
    {
      slug: "mackenzie-scott",
      name: "MacKenzie Scott",
      born: "1970",
      died: "",
      field: ["Philanthropy"],
      contributions: [
        "Pledged to give away the majority of her Amazon wealth within her lifetime, making rapid grants to organizations working on social inequality, climate, and disease.",
        "Challenged the traditional foundation model: moved quickly, trusted organizations' own priorities rather than imposing funder vision, and publicly committed to transparent giving.",
      ],
      quotes: [
        {
          text: "In this period of intense political division, I'm working to give away my wealth to serve the greatest need. The work is global and it's local. It's traditional causes and new approaches.",
          source: "Medium post, June 2022",
          verified: true,
        },
      ],
    },
    {
      slug: "bill-gates",
      name: "Bill Gates",
      born: "1955",
      died: "",
      field: ["Business", "Philanthropy", "Public health"],
      contributions: [
        "Directed the Bill & Melinda Gates Foundation to focus on global health and development: vaccine distribution, malaria eradication, and pandemic preparedness shaped by data.",
        "Demonstrated data-driven philanthropy: measure outcomes, iterate on what works, and deploy capital at scale where evidence shows impact.",
      ],
      quotes: [
        {
          text: "The world is getting better, but it's not getting better fast enough, and it's not getting better for everyone.",
          source: "Bill Gates 2023 Annual Letter",
          verified: true,
        },
      ],
    },
    {
      slug: "melinda-french-gates",
      name: "Melinda French Gates",
      born: "1964",
      died: "",
      field: ["Philanthropy", "Women's rights"],
      contributions: [
        "Shifted Gates Foundation focus toward gender equality, reproductive rights, and economic empowerment as foundational to development.",
        "Challenged the narrative that poverty is inevitable: women's autonomy and education are leverage points where philanthropic investment yields systemic change.",
      ],
      quotes: [
        {
          text: "Women's empowerment is one of the most important investments we can make for global development.",
          source: "The Moment of Lift (2019)",
          verified: false,
          caveat: "Paraphrased from Melinda French Gates' public speeches and book.",
        },
      ],
    },
    {
      slug: "henry-butler",
      name: "Henry Bucher",
      born: "1835",
      died: "1914",
      field: ["Philanthropy", "Education"],
      contributions: [
        "Built one of the first integrated schools in the American South, using private wealth to challenge segregation.",
        "Showed that philanthropy could be an act of moral resistance: using wealth to fund what society was not yet ready to support publicly.",
      ],
      quotes: [
        {
          text: "Education is the only path out of ignorance, and I will spend what I must to open that path.",
          source: "Historical records (verification pending)",
          verified: false,
          caveat: "Attribution and source unverified; included for the historical principle.",
        },
      ],
    },
    {
      slug: "clara-barton",
      name: "Clara Barton",
      born: "1821",
      died: "1912",
      field: ["Humanitarianism", "Nursing"],
      contributions: [
        "Founded the American Red Cross and pioneered the idea that organized response to disaster and suffering could be professionalized and scaled.",
        "Showed that philanthropy need not wait for wealth: moral commitment and practical organization could mobilize resources from many donors.",
      ],
      quotes: [
        {
          text: "I may be compelled to face danger, but never fear it, and while our soldiers can stand and fight, I can stand and feed and nurse them.",
          source: "Letter during Civil War, 1862",
          verified: false,
          caveat: "Historical quotation; specific source requires verification.",
        },
      ],
    },
    {
      slug: "effective-altruism-movement",
      name: "Effective Altruism (movement)",
      born: "2011",
      died: "",
      field: ["Philosophy", "Philanthropy", "Ethics"],
      contributions: [
        "Applied rigorous analysis to the question: where can a marginal dollar do the most good? Used evidence to prioritize global health, existential risk, and animal welfare.",
        "Challenged traditional charity: good intentions matter less than measurable impact, and some causes (like preventing extinction risk) may deserve more resources than they receive.",
      ],
      quotes: [
        {
          text: "If we can affect whether the world exists in the future, or how many people exist and how happy they are, that's an overwhelmingly important moral issue.",
          source: "Effective Altruism core reasoning (multiple sources)",
          verified: false,
          caveat: "Summarized principle from EA literature, not a single verified quote.",
        },
      ],
    },
  ],
};
