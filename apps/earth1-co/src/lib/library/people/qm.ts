import type { Person } from "../types";

export const qmPeople: Person[] = [
  {
    slug: "max-planck",
    name: "Max Planck",
    lived: "1858 Kiel – 1947 Göttingen",
    country: "Germany",
    known: "Started the quantum revolution by finding that energy comes in packets.",
    sections: ["quantum-mechanics"],
    who: "A conservative, deeply cultured German physicist who played piano well enough to consider music as a career. By 1900 he was a professor in Berlin, working on a stubborn problem: why does a hot object glow the colours it does?",
    work: [
      "Classical physics predicted that a hot cavity should shine with infinite energy at short wavelengths, an absurdity. In October 1900 Planck found a formula that matched the measurements exactly; in December he presented a derivation to the German Physical Society. To get it, he had to assume that the tiny oscillators in the walls could only exchange energy in lumps of size hν, with a new constant h.",
      "Planck regarded this as an accounting trick, not a statement about nature, and spent years trying to avoid its implications. It was Einstein in 1905 who insisted the lumps were real.",
    ],
    mattered: [
      "Planck's constant h now sets the scale at which the everyday world gives way to the quantum one. Since 2019 its value is exact and defines the kilogram. Almost every later step in this story, from Bohr's atom to the laser, grows from the idea that Planck reluctantly introduced.",
      "He stayed in Germany through the Nazi years, tried and failed to protect Jewish colleagues, and lost his son Erwin, executed in 1945 for the 1944 plot against Hitler. He won the Nobel Prize in 1918.",
    ],
    notes: [
      "The saying that science advances one funeral at a time is usually credited to Planck. What he wrote, in his Scientific Autobiography (1948), is a longer remark that a new truth triumphs not by convincing opponents but because they eventually die and a new generation grows up familiar with it. The short version is a paraphrase.",
    ],
    equations: ["planck-relation"],
    ideas: ["Quantisation", "Black-body radiation", "The Planck constant"],
    related: ["albert-einstein", "niels-bohr", "satyendra-nath-bose"],
  },
  {
    slug: "albert-einstein",
    name: "Albert Einstein",
    lived: "1879 Ulm – 1955 Princeton",
    country: "Germany, later Switzerland and the United States",
    known:
      "Showed that light is made of quanta, then spent his life doubting that quantum theory was the final word.",
    sections: ["quantum-mechanics"],
    who: "The physicist everyone knows for relativity, who was also, in 1905, the person who took Planck's idea seriously enough to say it was literally true. His Nobel Prize in 1921 was for the photoelectric effect, not for relativity.",
    work: [
      "In 1905 he proposed that light consists of discrete quanta (we now call them photons), which explains why light kicks electrons out of a metal only above a certain frequency. In 1907 he showed that quantisation also explains why solids hold heat the way they do. In 1916–17 he described how atoms absorb and emit light, including stimulated emission, the principle behind the laser. In 1924 he turned Satyendra Nath Bose's counting method for photons into a theory of matter.",
      "In 1935, with Boris Podolsky and Nathan Rosen, he published the EPR paper, arguing that quantum mechanics must be incomplete, because it allowed two separated particles to have correlated properties that nothing in the theory could explain locally. He never accepted that the probabilities in quantum theory were the final word.",
    ],
    mattered: [
      "Einstein is the founder and the great sceptic of quantum theory at once. His objections were not stubbornness; they were the sharpest questions anyone asked, and they drove Bohr to clarify his view and, decades later, John Bell to turn the EPR argument into an experiment. The answer came out against Einstein's hope for local hidden variables, but his question created the whole modern field of quantum information.",
    ],
    quotes: [
      {
        text: "Quantum mechanics is certainly imposing. But an inner voice tells me that it is not yet the real thing. The theory says a lot, but does not really bring us any closer to the secret of the 'old one'. I, at any rate, am convinced that He does not throw dice.",
        source: "Letter to Max Born, 4 December 1926, in The Born–Einstein Letters",
        caveat: "Translations of this letter vary slightly in wording.",
      },
      {
        text: "spukhafte Fernwirkung (spooky action at a distance)",
        source: "Letter to Max Born, 3 March 1947, in The Born–Einstein Letters",
        caveat:
          "The phrase is Einstein's, written to Born in German; he used it about the entanglement correlations.",
      },
    ],
    equations: ["photoelectric", "bell-state"],
    ideas: ["Photons", "Stimulated emission", "The EPR argument", "Local realism"],
    related: [
      "max-planck",
      "niels-bohr",
      "satyendra-nath-bose",
      "john-bell",
      "erwin-schrodinger",
    ],
  },
  {
    slug: "satyendra-nath-bose",
    name: "Satyendra Nath Bose",
    lived: "1894 Calcutta – 1974 Calcutta",
    country: "India",
    known:
      "Found the correct way to count photons, and with Einstein founded Bose–Einstein statistics.",
    sections: ["quantum-mechanics"],
    who: "A physicist at the University of Dhaka, with no doctorate, who in 1924 sent a four-page paper to Einstein after journals ignored it. A gifted teacher, he also loved music, languages and the Bengali literary world.",
    work: [
      "Bose derived Planck's black-body law without borrowing any classical argument, by treating photons as identical particles and counting arrangements in a new way: swapping two identical photons gives nothing new. Einstein recognised the importance, translated the paper into German himself and had it published. He then extended the idea to atoms.",
      "Particles that obey this counting rule are now called bosons. Cooled enough, they can all fall into the lowest state together: a Bose–Einstein condensate, predicted by Einstein in 1924–25 and first made in a laboratory in 1995 by Eric Cornell, Carl Wieman and Wolfgang Ketterle (Nobel Prize 2001).",
    ],
    mattered: [
      "Bose's counting is half of the quantum world's two families of particles: bosons, which like to bunch (light, lasers, superfluids), and fermions, which refuse to share (electrons, see Pauli). Bose never received a Nobel Prize; the particle family carries his name instead.",
    ],
    ideas: ["Bosons", "Identical particles", "Bose–Einstein condensate"],
    related: ["albert-einstein", "max-planck", "wolfgang-pauli"],
  },
  {
    slug: "niels-bohr",
    name: "Niels Bohr",
    lived: "1885 Copenhagen – 1962 Copenhagen",
    country: "Denmark",
    known:
      "Quantised the atom, then led the interpretation of quantum theory from Copenhagen.",
    sections: ["quantum-mechanics"],
    who: "A Danish physicist and a generous, endlessly talking teacher. His Institute for Theoretical Physics in Copenhagen became the meeting place where most of the founders of quantum mechanics argued their way to the theory.",
    work: [
      "In 1913 Bohr proposed that an electron in an atom can only occupy certain orbits with fixed energies, and that light is emitted or absorbed when it jumps between them. It explained the spectrum of hydrogen precisely. It was half classical and half quantum, and could not be the final theory, but it worked.",
      "In 1927 he introduced complementarity: the wave and particle descriptions of an electron are both needed, but no single experiment can show both at once. Together with Heisenberg and Born, this became the Copenhagen interpretation. His long public debates with Einstein, at the Solvay conferences of 1927 and 1930 and in the 1935 reply to EPR, are among the great arguments of science.",
    ],
    mattered: [
      "Bohr's insistence that physics describes what we can say about measurements, not a world independent of them, shaped how generations of physicists were taught. His critics find it evasive; his defenders find it the only honest reading. Either way it set the terms of the debate.",
      "In 1943 he escaped German-occupied Denmark by boat, and after the war wrote an open letter to the United Nations (1950) urging an open world and international control of atomic weapons. A shared humanity of knowledge was not a slogan for him.",
    ],
    notes: [
      "'Anyone who is not shocked by quantum theory has not understood it' is attributed to Bohr everywhere, but the version people quote comes from secondary reports, not from a text we can point to. Treat it as an anecdote.",
      "'Stop telling God what to do' as Bohr's reply to Einstein is likewise a story passed on at second hand, not a documented line.",
    ],
    equations: ["bohr-levels"],
    ideas: ["Complementarity", "The Copenhagen interpretation", "Quantum jumps"],
    related: ["albert-einstein", "werner-heisenberg", "max-born", "david-bohm"],
  },
  {
    slug: "louis-de-broglie",
    name: "Louis de Broglie",
    lived: "1892 Dieppe – 1987 Louveciennes",
    country: "France",
    known: "Proposed that matter has a wavelength.",
    sections: ["quantum-mechanics"],
    who: "A French aristocrat, born into the ducal house of Broglie, who began in history and turned to physics after the First World War, partly through his brother Maurice's X-ray laboratory.",
    work: [
      "In his 1924 doctoral thesis he argued that if light can behave as a particle, then particles such as electrons must behave as waves, with wavelength λ = h/p. It was a bold step with almost no experimental support. His examiner Paul Langevin sent a copy to Einstein, who approved. In 1927 Clinton Davisson and Lester Germer in the United States, and G. P. Thomson in Scotland, saw electrons diffract off crystals just as waves should.",
      "At the 1927 Solvay conference he presented a 'pilot wave' picture in which a real particle is guided by a real wave. It was received coolly and he dropped it; David Bohm revived it in 1952.",
    ],
    mattered: [
      "De Broglie's wave of matter gave Schrödinger his starting point and gave us electron microscopes, which see with the short wavelength of fast electrons. His 1929 Nobel Prize was awarded for a thesis written five years earlier.",
    ],
    equations: ["de-broglie"],
    ideas: ["Matter waves", "Wave–particle duality", "Pilot-wave theory"],
    related: ["erwin-schrodinger", "david-bohm", "albert-einstein"],
  },
  {
    slug: "werner-heisenberg",
    name: "Werner Heisenberg",
    lived: "1901 Würzburg – 1976 Munich",
    country: "Germany",
    known:
      "Built the first complete quantum mechanics and discovered the uncertainty principle.",
    sections: ["quantum-mechanics"],
    who: "A young prodigy from Munich who studied under Sommerfeld and then joined Born in Göttingen and Bohr in Copenhagen. In June 1925, plagued by hay fever, he retreated to the bare North Sea island of Helgoland and there worked out the first workable quantum mechanics.",
    work: [
      "Heisenberg's matrix mechanics (1925, completed with Born and Pascual Jordan) discarded the picture of electrons orbiting like planets and built the theory only from what could be observed: the frequencies and intensities of light. It used quantities whose product depends on order, which Born recognised as matrices.",
      "In 1927 he showed that position and momentum cannot both be sharp. The uncertainty principle is not a limit of measuring clumsiness; it falls out of the maths. He received the 1932 Nobel Prize.",
    ],
    mattered: [
      "Together with Schrödinger's equation, Heisenberg's work is the foundation of every quantum calculation done today. The uncertainty principle also changed philosophy: it ended the idea, held since Newton and Laplace, that a complete knowledge of the present determines the future.",
      "In the Second World War he led the German nuclear energy project. What he intended, and how much he understood, is still debated by historians, and his 1941 meeting with Bohr in occupied Copenhagen remains one of the most argued-over conversations of the century. A fair account has to hold both his scientific greatness and that history.",
    ],
    quotes: [
      {
        text: "We have to remember that what we observe is not nature in itself but nature exposed to our method of questioning.",
        source: "Physics and Philosophy: The Revolution in Modern Science (1958)",
      },
    ],
    equations: ["commutator", "uncertainty"],
    ideas: ["Matrix mechanics", "Uncertainty", "Observables"],
    related: ["niels-bohr", "max-born", "erwin-schrodinger", "wolfgang-pauli"],
  },
  {
    slug: "max-born",
    name: "Max Born",
    lived: "1882 Breslau (now Wrocław) – 1970 Göttingen",
    country: "Germany, later Britain",
    known: "Showed that the wave function gives probabilities.",
    sections: ["quantum-mechanics"],
    who: "A mathematically gifted physicist who ran the Göttingen institute that trained a generation of quantum pioneers. When Heisenberg showed him his Helgoland calculation, Born realised the strange multiplication rule was matrix multiplication, which he had learned as a student.",
    work: [
      "With Heisenberg and Jordan he built matrix mechanics. In 1926, studying electron collisions, he saw how to read Schrödinger's wave function: its squared size is the probability of finding the particle. The footnote where he first said it is among the most consequential in physics.",
      "He also co-developed the Born–Oppenheimer approximation, which lets chemists treat nuclei as fixed while electrons move, the basis of nearly all quantum chemistry.",
    ],
    mattered: [
      "The Born rule is the single bridge between quantum maths and what a laboratory records. Everything else, such as measurement, superposition and chance, hangs on it. Born received the Nobel Prize only in 1954, nearly three decades after the work. Dismissed from Göttingen in 1933 for his Jewish background, he found refuge in Cambridge and Edinburgh, and in 1957 he signed the Göttingen Manifesto against arming West Germany with nuclear weapons.",
    ],
    equations: ["born-rule", "commutator"],
    ideas: ["The probability interpretation", "Matrix mechanics"],
    related: ["werner-heisenberg", "erwin-schrodinger", "albert-einstein", "niels-bohr"],
  },
  {
    slug: "erwin-schrodinger",
    name: "Erwin Schrödinger",
    lived: "1887 Vienna – 1961 Vienna",
    country: "Austria",
    known:
      "Wrote the wave equation of quantum mechanics and coined the term 'entanglement'.",
    sections: ["quantum-mechanics"],
    who: "A restless, wide-reading Viennese physicist who moved between Zürich, Berlin, Oxford, Graz and, after 1939, Dublin. Over Christmas 1925 he went to a Swiss mountain resort and came back with the equation that carries his name.",
    work: [
      "In 1926 he published a series of papers presenting a wave equation for matter, building on de Broglie. It reproduced the hydrogen spectrum in the language of ordinary differential equations that physicists already knew, and he soon showed it equivalent to Heisenberg's matrices. He hoped it described real waves; Born's interpretation showed it did not.",
      "In 1935, in response to EPR, he introduced the word Verschränkung, 'entanglement', and the thought experiment of the cat: a cat in a box whose fate hangs on a single quantum event, to show how absurd it was to treat superposition as a literal description of large things. He meant it as a criticism; today it is the best-known picture of quantum strangeness.",
      "In Dublin he gave the lectures published as What Is Life? (1944), which asked how a molecule could carry heredity and inspired many young scientists to turn to biology.",
    ],
    mattered: [
      "Most working physicists and chemists spend their days solving some version of the Schrödinger equation. Entanglement, a word he introduced almost in passing, became the central resource of quantum information. He shared the 1933 Nobel Prize with Dirac. He left Germany in 1933 in opposition to the Nazis, and his unconventional private life cost him positions along the way.",
    ],
    equations: ["schrodinger", "bell-state"],
    ideas: ["The wave function", "Entanglement", "Schrödinger's cat"],
    related: ["louis-de-broglie", "max-born", "albert-einstein", "wojciech-zurek"],
  },
  {
    slug: "wolfgang-pauli",
    name: "Wolfgang Pauli",
    lived: "1900 Vienna – 1958 Zürich",
    country: "Austria, later Switzerland",
    known: "Explained why matter takes up space, and predicted the neutrino.",
    sections: ["quantum-mechanics"],
    who: "A brilliant and sharply critical Viennese physicist, nicknamed by colleagues 'the conscience of physics' for his fearsome dismissals of sloppy work. Friends joked about the 'Pauli effect', the claim that equipment broke when he walked into a laboratory.",
    work: [
      "In 1925 he proposed the exclusion principle: no two electrons in an atom can share the same set of quantum numbers. It explains the shell structure of atoms and therefore the entire periodic table. Later work showed it follows from a deeper rule: identical fermions have antisymmetric wave functions.",
      "In 1927 he introduced the matrices (now Pauli matrices) that describe an electron's spin. In December 1930, in a letter addressed to 'Dear radioactive ladies and gentlemen', he suggested a neutral, very light particle to save the conservation of energy in radioactive decay. Enrico Fermi named it the neutrino, and it was detected in 1956 by Clyde Cowan and Frederick Reines.",
    ],
    mattered: [
      "Without the exclusion principle atoms would collapse into the lowest state and chemistry would not exist. Pauli's spin matrices are, almost literally, the gates of quantum computing (see the Quantum Computing section). He received the Nobel Prize in 1945, with Einstein among his nominators.",
    ],
    equations: ["exclusion"],
    ideas: ["Spin", "Fermions", "The periodic table", "The neutrino"],
    related: ["werner-heisenberg", "paul-dirac", "satyendra-nath-bose"],
  },
  {
    slug: "paul-dirac",
    name: "Paul Dirac",
    lived: "1902 Bristol – 1984 Tallahassee",
    country: "United Kingdom",
    known: "Merged quantum mechanics with relativity and predicted antimatter.",
    sections: ["quantum-mechanics"],
    who: "A famously quiet English physicist, trained first as an electrical engineer. At Cambridge he turned quickly into one of the most formal and elegant theorists of the century, and he held Newton's old Lucasian professorship.",
    work: [
      "In 1928 he found a relativistic wave equation for the electron. It automatically gave spin, and it also had solutions of negative energy, which after some wrestling he interpreted in 1931 as a new particle with the electron's mass and opposite charge. Carl Anderson found the positron in cosmic rays in 1932.",
      "His textbook The Principles of Quantum Mechanics (1930) set out the abstract language, including the bra-ket notation, that physicists still use. He also anticipated quantum field theory, and in 1931 showed that a single magnetic monopole somewhere in the universe would explain why electric charge comes in fixed units.",
    ],
    mattered: [
      "Antimatter was the first prediction of a whole new kind of matter from pure mathematics, a pattern that would repeat through particle physics. Dirac won the 1933 Nobel Prize at thirty-one. His bra-ket notation, |ψ⟩, is the writing system of quantum computing.",
    ],
    quotes: [
      {
        text: "The underlying physical laws necessary for the mathematical theory of a large part of physics and the whole of chemistry are thus completely known, and the difficulty is only that the exact application of these laws leads to equations much too complicated to be soluble.",
        source:
          "'Quantum Mechanics of Many-Electron Systems', Proceedings of the Royal Society A 123 (1929)",
      },
    ],
    equations: ["dirac"],
    ideas: ["Antimatter", "Bra-ket notation", "Relativistic quantum theory"],
    related: ["wolfgang-pauli", "richard-feynman", "werner-heisenberg"],
  },
  {
    slug: "john-von-neumann",
    name: "John von Neumann",
    lived: "1903 Budapest – 1957 Washington",
    country: "Hungary, later the United States",
    known:
      "Gave quantum mechanics its mathematical foundation and defined the measurement problem.",
    sections: ["quantum-mechanics"],
    who: "A Hungarian-born mathematician of astonishing speed, who contributed to set theory, game theory, economics, computing and nuclear weapons design.",
    work: [
      "His 1932 book Mathematische Grundlagen der Quantenmechanik presented quantum theory as geometry in an abstract space of states (Hilbert space), unifying Heisenberg's and Schrödinger's versions. He introduced the density matrix, which handles mixed and uncertain states, and the entropy that bears his name.",
      "He also analysed measurement carefully. A quantum state evolves smoothly under the Schrödinger equation until someone measures it, when it jumps. Von Neumann showed that the cut between the quantum system and the observer can be placed almost anywhere without changing predictions, which is what makes the 'measurement problem' so awkward.",
    ],
    mattered: [
      "Von Neumann's framework is still the standard textbook form of the theory, and it is the mathematical home of quantum information. His 1932 argument that hidden variables are impossible was widely believed for decades, until Grete Hermann (1935) and John Bell (1966) pointed out that it ruled out far less than people thought.",
    ],
    equations: ["von-neumann-entropy"],
    ideas: ["Hilbert space", "Density matrices", "The measurement problem"],
    related: ["john-bell", "hugh-everett", "paul-dirac"],
  },
  {
    slug: "richard-feynman",
    name: "Richard Feynman",
    lived: "1918 New York – 1988 Los Angeles",
    country: "United States",
    known:
      "Reformulated quantum theory with sums over histories and pointed toward quantum computers.",
    sections: ["quantum-mechanics", "quantum-computing"],
    who: "A New Yorker with a bongo-drum and a talent for explaining anything. As a young man he worked on the Manhattan Project at Los Alamos, later taught at Caltech, and became the best-loved physics teacher of the twentieth century.",
    work: [
      "In the late 1940s he developed quantum electrodynamics, the quantum theory of light and electrons, in a new form: the path integral, in which a particle takes every possible route and the results are added up. He also invented Feynman diagrams, drawings that turn terrifying calculations into bookkeeping of particles meeting and parting. He shared the 1965 Nobel Prize with Julian Schwinger and Sin-Itiro Tomonaga.",
      "In 1981 at a conference at MIT on the physics of computation he asked how to simulate quantum systems efficiently, and argued that ordinary computers cannot do it because the cost explodes with size. His answer was to build a computer out of quantum parts. The talk was published in 1982 and is the usual starting point of quantum computing.",
    ],
    mattered: [
      "The path integral is the main language of modern particle physics. The 1981 talk turned quantum mechanics from a theory we describe into a resource we use. His Lectures on Physics (1963–65) are still among the best introductions to the subject.",
    ],
    quotes: [
      {
        text: "I think I can safely say that nobody understands quantum mechanics.",
        source: "The Character of Physical Law (1965), chapter 6",
      },
      {
        text: "Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical, and by golly it's a wonderful problem, because it doesn't look so easy.",
        source:
          "'Simulating Physics with Computers', International Journal of Theoretical Physics 21 (1982)",
      },
    ],
    notes: [
      "'Shut up and calculate' is often credited to Feynman. The phrase was coined by the physicist N. David Mermin, who has said so himself; it does not appear in Feynman's writing.",
      "The line printed on this site's founder page, 'What I cannot create, I do not understand', was found on Feynman's blackboard at his death in 1988. It was a note to himself, not a published statement.",
    ],
    equations: ["path-integral"],
    ideas: ["Sum over histories", "Feynman diagrams", "Quantum simulation"],
    related: ["paul-dirac", "david-deutsch", "paul-benioff"],
  },
  {
    slug: "david-bohm",
    name: "David Bohm",
    lived: "1917 Wilkes-Barre – 1992 London",
    country: "United States, later Brazil, Israel and Britain",
    known:
      "Showed that quantum mechanics can be completed with particles that have definite positions.",
    sections: ["quantum-mechanics"],
    who: "An American physicist who studied under Oppenheimer. Called before the House Un-American Activities Committee in 1949, he refused to testify against colleagues, lost his post at Princeton, and spent the rest of his life abroad: São Paulo, Haifa, Bristol and finally Birkbeck College in London.",
    work: [
      "In 1952 he published a theory showing that de Broglie's pilot-wave picture could reproduce all the predictions of quantum mechanics. In it, particles have real positions at all times and are guided by a wave function, while the apparent randomness comes from ignorance of those positions. It proved that the 'impossibility proofs' for hidden variables were not as general as claimed. With Yakir Aharonov he also predicted the Aharonov–Bohm effect (1959).",
    ],
    mattered: [
      "Bohm's theory was ignored for decades, but it inspired John Bell to ask what any such theory must be like, and Bell found that it must be non-local: what happens here depends instantly on what is done there. Bohmian mechanics is now a respected alternative to Copenhagen and many-worlds, and a reminder that the standard story is not forced on us by the data.",
    ],
    ideas: ["Pilot-wave theory", "Hidden variables", "Non-locality"],
    related: ["louis-de-broglie", "john-bell", "niels-bohr"],
  },
  {
    slug: "chien-shiung-wu",
    name: "Chien-Shiung Wu",
    lived: "1912 Liuhe – 1997 New York",
    country: "China, later the United States",
    known:
      "Experimentalist who tested the weak force and observed correlated entangled photons in 1950.",
    sections: ["quantum-mechanics"],
    who: "Born near Shanghai, she came to the University of California, Berkeley in 1936, worked on the Manhattan Project at Columbia, and became one of the finest experimental physicists of her time, nicknamed the 'First Lady of Physics'.",
    work: [
      "In 1950 she and Irving Shaknov measured the polarisation of the two gamma-ray photons produced when an electron and a positron annihilate, and found them correlated in the way quantum theory required. It is often regarded as the first laboratory observation of correlations between entangled photons, and was cited by the later Bell tests.",
      "Her best-known experiment, in 1956–57, showed that the weak nuclear force breaks mirror symmetry (parity). Her colleagues T. D. Lee and C. N. Yang received the Nobel Prize for proposing the idea; she did not.",
    ],
    mattered: [
      "Wu's work is a reminder that quantum theory is not only a history of equations; it was built as much by experimenters who found ways to make the strange predictions visible. The omission of her name from the 1957 Nobel Prize is one of the best-known oversights in the prize's history.",
    ],
    ideas: ["Entangled photons", "Parity violation", "Experimental physics"],
    related: [
      "john-bell",
      "alain-aspect-john-clauser-anton-zeilinger",
      "albert-einstein",
    ],
  },
  {
    slug: "john-bell",
    name: "John Stewart Bell",
    lived: "1928 Belfast – 1990 Geneva",
    country: "Northern Ireland, United Kingdom",
    known:
      "Proved that no local hidden-variable theory can reproduce quantum mechanics, and turned that into an experiment.",
    sections: ["quantum-mechanics"],
    who: "A Belfast-born particle physicist who worked at CERN designing accelerators and calculating particle physics. Quantum foundations was his night-time passion; he called it his hobby.",
    work: [
      "In 1964, on leave at Stanford, he published 'On the Einstein Podolsky Rosen Paradox'. He showed that if measurement outcomes were fixed in advance by hidden facts local to each particle, then the correlations between two distant measurements would obey an inequality. Quantum theory predicts violations of that inequality. It was a result you could test.",
      "He also found the flaw in von Neumann's 1932 no-hidden-variables proof (published 1966), and collected his essays in Speakable and Unspeakable in Quantum Mechanics (1987). He pressed physicists to say clearly what they meant by 'measurement'.",
    ],
    mattered: [
      "Bell's theorem took a philosophical dispute between Einstein and Bohr and made it an experimental question. The experiments of Clauser, Aspect and Zeilinger, and the loophole-free tests of 2015, came down against local hidden variables. The nature of reality, in this narrow sense, was settled by a laboratory result. Bell died suddenly of a stroke in 1990, aged 62, and never saw the prize his work was widely thought to deserve.",
    ],
    equations: ["chsh", "bell-state"],
    ideas: ["Bell's theorem", "Non-locality", "Hidden variables"],
    related: [
      "albert-einstein",
      "david-bohm",
      "alain-aspect-john-clauser-anton-zeilinger",
      "john-von-neumann",
    ],
  },
  {
    slug: "hugh-everett",
    name: "Hugh Everett III",
    lived: "1930 Washington, D.C. – 1982 McLean, Virginia",
    country: "United States",
    known:
      "Proposed that the wave function never collapses: the many-worlds interpretation.",
    sections: ["quantum-mechanics"],
    who: "A Princeton PhD student under John Wheeler who asked a simple question: what if the Schrödinger equation is all there is, including for the observer?",
    work: [
      "His 1957 thesis, published as 'Relative State Formulation of Quantum Mechanics', dropped the collapse. When an observer measures a superposed system, the observer becomes entangled with it, and each outcome is seen by a version of the observer that sees that outcome. The theory is deterministic. The branches do not interact once they have decohered. Bryce DeWitt later popularised it as 'many worlds'.",
      "Bohr's circle did not welcome it; a 1959 visit to Copenhagen went badly. Everett left academic physics for military operations research at the Pentagon, working on nuclear war planning, and died of a heart attack at fifty-one.",
    ],
    mattered: [
      "Many-worlds was almost ignored in his lifetime and is now one of the main interpretations, favoured by many cosmologists and by David Deutsch, who used it to motivate quantum computing. Its great merit is that it takes the equation at its word; its cost is a vast multiplication of outcomes that some find unbearable and others find simply the way things are.",
    ],
    ideas: ["Many worlds", "Relative states", "No collapse"],
    related: ["david-deutsch", "hd-zeh", "john-von-neumann"],
  },
  {
    slug: "hd-zeh",
    name: "H. Dieter Zeh",
    lived: "1932 Braunschweig – 2018 Heidelberg",
    country: "Germany",
    known:
      "Discovered decoherence: how the environment makes quantum systems look classical.",
    sections: ["quantum-mechanics"],
    who: "A theoretical physicist at Heidelberg who worked on quantum foundations from the 1960s, often without much support.",
    work: [
      "In a 1970 paper he showed that a quantum system is never truly isolated. Its interaction with the surrounding air, light and heat entangles it with the environment, and the interference between possibilities spreads out into that environment where it can no longer be recovered. To anyone looking only at the system, it appears to have chosen one outcome.",
    ],
    mattered: [
      "Decoherence explains why you do not see cats in two states. It does not by itself say why one outcome occurs, so it is invoked by Everettians, Bohmians and Copenhagen alike. It is also the main enemy of quantum computers, which must fight it constantly.",
    ],
    ideas: ["Decoherence", "Environment-induced classicality"],
    related: ["wojciech-zurek", "hugh-everett"],
  },
  {
    slug: "wojciech-zurek",
    name: "Wojciech Zurek",
    lived: "born 1951, Poland",
    country: "Poland, working in the United States",
    known: "Developed the decoherence programme and co-proved the no-cloning theorem.",
    sections: ["quantum-mechanics", "quantum-computing"],
    who: "A physicist at Los Alamos National Laboratory who, since the early 1980s, has pursued the question of how the classical world emerges from the quantum one.",
    work: [
      "In 1981–82 he showed how the environment selects a small set of 'pointer states' that survive measurement, and with Wootters (and independently Dieks) he proved in 1982 that an unknown quantum state cannot be copied. His later 'quantum Darwinism' says the states we perceive are those that leave many redundant copies of themselves in the environment.",
    ],
    mattered: [
      "The no-cloning theorem underlies quantum cryptography's security and shapes every error-correcting scheme in quantum computing. The decoherence programme tells us why classical physics works at all.",
    ],
    equations: ["no-cloning"],
    ideas: ["Decoherence", "Pointer states", "No-cloning", "Quantum Darwinism"],
    related: ["hd-zeh", "erwin-schrodinger", "charles-bennett-gilles-brassard"],
  },
  {
    slug: "alain-aspect-john-clauser-anton-zeilinger",
    name: "John Clauser, Alain Aspect and Anton Zeilinger",
    lived:
      "Clauser b. 1942, United States · Aspect b. 1947, France · Zeilinger b. 1945, Austria",
    country: "United States, France and Austria",
    known:
      "Tested Bell's inequality and showed the quantum world is not locally real; Nobel Prize in Physics 2022.",
    sections: ["quantum-mechanics", "quantum-computing"],
    who: "Three experimentalists who turned a philosophical argument into a laboratory result, sharing the 2022 Nobel Prize for experiments with entangled photons, establishing the violation of Bell inequalities and pioneering quantum information science.",
    work: [
      "Clauser, with Stuart Freedman, performed the first Bell test in 1972 at Berkeley (building on the 1969 CHSH proposal he co-wrote), when the subject was so unfashionable that he struggled to find support for it. Aspect, in Orsay in 1981–82, improved the test by switching the measurement settings while the photons were in flight, closing a loophole. Zeilinger's Vienna group pushed to larger distances, to teleportation (1997), and, with other groups, to loophole-free tests in 2015.",
    ],
    mattered: [
      "The results say that no theory in which each particle carries its own pre-set answers and nothing travels faster than light can account for what we see. How to read that remains disputed, but the experiments are not. The same techniques, entangled photons sent over fibre and by satellite, are the foundation of quantum communication and cryptography.",
    ],
    equations: ["chsh", "bell-state"],
    ideas: ["Bell tests", "Entangled photons", "Quantum teleportation"],
    related: [
      "john-bell",
      "albert-einstein",
      "chien-shiung-wu",
      "charles-bennett-gilles-brassard",
    ],
  },
];
