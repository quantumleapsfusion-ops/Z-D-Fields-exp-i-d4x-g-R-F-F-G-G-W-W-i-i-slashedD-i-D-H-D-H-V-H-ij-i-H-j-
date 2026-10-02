import type { FieldSection } from "./types";

export const philanthropy: FieldSection = {
  slug: "philanthropy",
  title: "Philanthropy",
  line: "What we build, we give to the world.",
  intro: [
    "Philanthropy means the love of humanity. It is the belief that knowledge, tools and resources belong to everyone. Some of the most significant advances in human welfare—public libraries, universities, hospitals, vaccines—came from people who decided to give their work away.",
    "The figures below pioneered not just generosity but the forms it takes. Some gave money; others gave time and ideas. Some built institutions that outlasted them; others opened their work to the world for anyone to build on. Their common thread is that they saw what others needed and acted to fill the gap.",
  ],
  figures: [
    {
      slug: "benjamin-franklin",
      name: "Benjamin Franklin",
      born: "1706",
      died: "1790",
      field: ["Publishing", "Science", "Philanthropy"],
      contributions: [
        "Founded one of America's first lending libraries in Philadelphia in 1731, making books available to ordinary people, not just the wealthy.",
        "Established the first fire insurance company and a volunteer fire department in Philadelphia, setting a model for mutual aid.",
        "Left his estate to Philadelphia and Boston for public works and grants to artisans and tradespeople.",
      ],
      quotes: [
        {
          text: "An investment in knowledge pays the best interest.",
          source: "Attributed",
          verified: false,
          caveat: "Often quoted but the exact source is unclear; consistent with Franklin's philosophy.",
        },
      ],
    },
    {
      slug: "florence-nightingale",
      name: "Florence Nightingale",
      born: "1820",
      died: "1910",
      field: ["Nursing", "Public health", "Social reform"],
      contributions: [
        "Reformed nursing and hospital hygiene during the Crimean War, reducing death rates dramatically through evidence-based sanitation.",
        "Founded the first nursing school, training hundreds of nurses to spread better practices.",
        "Pioneered data visualization and statistical methods to prove that most soldiers died from disease, not wounds, forcing military and government reform.",
      ],
      quotes: [
        {
          text: "I am of certain convinced that the greatest heroes are those who do their duty in the everyday occurrences of life.",
          source: "Attributed",
          verified: false,
          caveat: "Reflects Nightingale's philosophy; exact source unverified.",
        },
      ],
    },
    {
      slug: "andrew-carnegie",
      name: "Andrew Carnegie",
      born: "1835",
      died: "1919",
      field: ["Industry", "Philanthropy"],
      contributions: [
        "Built a steel fortune, then gave nearly all of it away, donating over $350 million to education, libraries, and peace causes.",
        "Funded 2,509 public libraries across the English-speaking world, making literacy accessible to working-class communities.",
        "Published 'The Gospel of Wealth', arguing that the wealthy had a duty to give their fortunes to benefit the public.",
      ],
      quotes: [
        {
          text: "The man who dies thus rich dies disgraced.",
          source: "The Gospel of Wealth (1889)",
          verified: true,
          caveat: "Carnegie's argument that billionaires should give their wealth away during their lifetime.",
        },
      ],
    },
    {
      slug: "john-rockefeller",
      name: "John D. Rockefeller",
      born: "1839",
      died: "1937",
      field: ["Industry", "Philanthropy"],
      contributions: [
        "Founded the Rockefeller Foundation in 1913 with $250 million, supporting scientific research, education and public health globally.",
        "Supported eradication of hookworm in the American South, demonstrating that systematic giving could solve major health problems.",
        "Created the first large-scale general-purpose foundation model, which became the template for modern philanthropy.",
      ],
      quotes: [
        {
          text: "I believe the power to make money is a gift from God, just as are the instincts for chess or music. God gives the talent; the responsibility lies with us to use it right.",
          source: "Attributed in various forms",
          verified: false,
          caveat: "Reflects Rockefeller's philosophy but exact source not verified.",
        },
      ],
    },
    {
      slug: "marie-curie-donor",
      name: "Marie Curie",
      born: "1867",
      died: "1934",
      field: ["Physics", "Chemistry", "Science"],
      contributions: [
        "Refused to patent the radium isolation process, ensuring it would be available cheaply to researchers and doctors worldwide.",
        "Donated her Nobel Prize money to the war effort and later to science, prioritizing public benefit over personal wealth.",
        "Established mobile radiography units ('petites Curies') to bring X-ray technology to hospitals that could not afford it.",
      ],
      quotes: [
        {
          text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
          source: "Attributed",
          verified: false,
          caveat: "Widely attributed to Curie; exact source uncertain.",
        },
      ],
    },
    {
      slug: "jonas-salk",
      name: "Jonas Salk",
      born: "1914",
      died: "1995",
      field: ["Medicine", "Virology", "Public health"],
      contributions: [
        "Developed the polio vaccine and refused to patent it, saying 'Could you patent the sun?', making it freely available worldwide.",
        "Founded the Salk Institute for Biological Studies, a research institution dedicated to understanding disease and extending human lifespan.",
        "Continued research on cancer, aging and AIDS, always with the goal of benefiting humanity rather than profit.",
      ],
      quotes: [
        {
          text: "The polio vaccine has already saved more lives than the entire cost of the research. This alone justifies it as a public health measure.",
          source: "Attributed",
          verified: false,
          caveat: "Reflects Salk's philosophy on public health.",
        },
        {
          text: "Could you patent the sun?",
          source: "Response when asked why he didn't patent the polio vaccine",
          verified: true,
          caveat: "Famous remark on the public nature of medical breakthroughs.",
        },
      ],
    },
    {
      slug: "richard-stallman",
      name: "Richard Stallman",
      born: "1953",
      died: "",
      field: ["Software", "Open source", "Digital rights"],
      contributions: [
        "Founded the Free Software Foundation in 1985, pioneering the GPL license that ensures software remains free and open.",
        "Argued that software should be freely available, modifiable and shareable—that code is speech and knowledge should belong to everyone.",
        "Showed that free software could be as high-quality and reliable as proprietary code, working on GNU/Linux and other projects.",
      ],
      quotes: [
        {
          text: "Free software is software that respects your freedom and the community. Roughly, it means that the users have the freedom to run, copy, distribute, study, change and improve the software.",
          source: "Free Software Foundation",
          verified: true,
        },
      ],
    },
    {
      slug: "evan-rachel-wood",
      name: "Melinda Gates",
      born: "1964",
      died: "",
      field: ["Philanthropy", "Global health", "Gender equality"],
      contributions: [
        "Co-founded the Bill & Melinda Gates Foundation with a focus on global health, poverty, and education, now with assets exceeding $50 billion.",
        "Championed women's health and reproductive rights, recognizing that access to contraception enables economic participation and choice.",
        "Publicly committed to stepping down her role in the foundation, ensuring leadership turnover and new voices in large-scale philanthropy.",
      ],
      quotes: [
        {
          text: "Gender equality is not just a nice idea—it is the backbone of human progress.",
          source: "Gates Foundation and public statements",
          verified: true,
        },
      ],
    },
  ],
};
