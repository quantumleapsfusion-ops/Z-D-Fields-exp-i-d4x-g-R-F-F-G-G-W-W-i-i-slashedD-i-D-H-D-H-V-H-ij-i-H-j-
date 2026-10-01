import type { Topic } from "./types";

const t = String.raw;

export const mathematicsTopics: Topic[] = [
  {
    id: "euclid",
    title: "Euclid's geometry",
    paragraphs: [
      "Around 300 BC in Alexandria, Euclid collected the geometry of his day into the Elements, thirteen books that were still used as a school text two thousand years later. Its method mattered more than any single result. It starts from a short list of definitions, five postulates and a few common notions, and then proves every proposition from those and from propositions already proved.",
      "The fifth postulate, on parallel lines, is the odd one out: longer and less obvious than the rest. For centuries people tried to prove it from the other four and failed. In the nineteenth century Lobachevsky, Bolyai and Gauss showed why. You can replace it and still get a consistent geometry, one in which the angles of a triangle add up to less than two right angles. Riemann went on to describe curved spaces in general, and Einstein used that geometry for gravity.",
      "Book I ends with Pythagoras' theorem and its converse. Book IX proves that there is no largest prime: multiply any finite list of primes together, add one, and the result has a prime factor missing from the list.",
    ],
    equations: [
      {
        tex: t`a^2 + b^2 = c^2`,
        label: "a squared plus b squared equals c squared",
        note: "In a right-angled triangle, c is the side opposite the right angle (Elements I.47).",
      },
    ],
  },
  {
    id: "calculus",
    title: "Calculus",
    paragraphs: [
      "Calculus is the mathematics of change. The derivative measures how fast a quantity changes at an instant; the integral adds up infinitely many small pieces to give a total, such as the area under a curve or the distance covered at a varying speed.",
      "Newton and Leibniz found the methods independently, Newton in the mid-1660s and Leibniz in the mid-1670s. Leibniz published first, in 1684 and 1686. The quarrel over priority soured relations between English and continental mathematicians for a century. Both men saw the central fact: differentiation and integration undo each other. That is the fundamental theorem of calculus.",
      "The notation in use today is mostly Leibniz's: dy/dx for the derivative and the long S of the integral sign, from the Latin summa. It survived because it does some of the thinking for you. The chain rule, for example, looks like cancelling fractions. Cauchy and Weierstrass gave the subject a rigorous footing in the nineteenth century with limits, replacing the 'infinitely small' quantities that Bishop Berkeley had attacked in 1734.",
    ],
    equations: [
      {
        tex: t`f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}`,
        label:
          "f prime of x equals the limit as h goes to zero of f of x plus h minus f of x, over h",
        note: "The derivative: the slope of the curve at a single point.",
      },
      {
        tex: t`\int_a^b f'(x)\,dx = f(b) - f(a)`,
        label: "the integral from a to b of f prime of x d x equals f of b minus f of a",
        note: "The fundamental theorem: adding up the rate of change gives the total change.",
      },
    ],
  },
  {
    id: "leibniz",
    title: "Leibniz",
    paragraphs: [
      "Gottfried Wilhelm Leibniz (1646–1716) was a lawyer, diplomat and librarian to the House of Hanover, and did his mathematics alongside all of it. Besides the calculus, he worked out binary arithmetic and showed how every number can be written with 0 and 1. He built a mechanical calculator, the stepped reckoner, that could multiply and divide. He also hoped for a universal symbolic language in which disputes could be settled by calculation.",
      "His series for π, the alternating sum of the reciprocals of the odd numbers, converges far too slowly to be useful for computing. It is still a striking result, because it links π to nothing more than the odd integers. Madhava of Sangamagrama in Kerala had found the same series about two and a half centuries earlier.",
    ],
    equations: [
      {
        tex: t`\frac{\pi}{4} = 1 - \frac{1}{3} + \frac{1}{5} - \frac{1}{7} + \cdots`,
        label: "pi over 4 equals 1 minus a third plus a fifth minus a seventh and so on",
      },
    ],
  },
  {
    id: "differential-equations",
    title: "Differential equations",
    paragraphs: [
      "A differential equation states a relation between a quantity and its rates of change. Most laws of physics take this form. They describe how a system changes from one moment to the next, and the solution tells you where it will be later.",
      "The simplest interesting example says that a quantity grows at a rate proportional to its size. Its solution is the exponential function. It describes unchecked population growth, compound interest and, with a negative constant, radioactive decay. A mass on a spring obeys a second-order equation, and its solution is a sine wave.",
      "Most differential equations cannot be solved in closed form. Euler gave the first numerical method in the 1760s: take small steps, each in the direction the equation points. Poincaré, studying the three-body problem in the 1880s, changed the question from 'what is the formula?' to 'what does the solution look like?' That shift led eventually to chaos theory.",
    ],
    equations: [
      {
        tex: t`\frac{dy}{dt} = ky \quad\Longrightarrow\quad y(t) = y_0\,e^{kt}`,
        label: "d y d t equals k y, so y of t equals y nought times e to the k t",
        note: "Growth (k > 0) or decay (k < 0) at a rate set by the current amount.",
      },
      {
        tex: t`m\,\ddot{x} = -kx \quad\Longrightarrow\quad x(t) = A\cos(\omega t + \varphi),\ \ \omega = \sqrt{k/m}`,
        label:
          "m x double dot equals minus k x, so x of t equals A cosine of omega t plus phi, with omega equal to the square root of k over m",
        note: "The harmonic oscillator: a mass m on a spring of stiffness k.",
      },
    ],
  },
  {
    id: "linear-algebra",
    title: "Linear algebra and vectors",
    paragraphs: [
      "A vector is a quantity with both size and direction, such as a velocity, a force or a displacement. In coordinates it is a list of numbers, and vectors are added component by component. The dot product of two vectors measures how far they point the same way. It is zero exactly when they are perpendicular.",
      "A matrix is a rectangular array of numbers that describes a linear map. A linear map sends straight lines to straight lines and keeps the origin fixed. Rotations, reflections, stretches and shears are all linear maps. Multiplying two matrices gives the map that does one and then the other, so the order matters.",
      "Solving many linear equations at once is the oldest use of the subject. The Chinese text The Nine Chapters on the Mathematical Art, compiled by the second century AD, solves such systems by the method now called Gaussian elimination. Eigenvectors are the directions a map only stretches, without turning. They underlie the natural frequencies of a bridge, the principal components of a data set and the energy levels of an atom.",
    ],
    equations: [
      {
        tex: t`\mathbf{a}\cdot\mathbf{b} = a_1b_1 + a_2b_2 + a_3b_3 = |\mathbf{a}|\,|\mathbf{b}|\cos\theta`,
        label:
          "a dot b equals a1 b1 plus a2 b2 plus a3 b3, which equals the length of a times the length of b times cosine theta",
      },
      {
        tex: t`A\mathbf{v} = \lambda\mathbf{v}`,
        label: "A v equals lambda v",
        note: "v is an eigenvector of the matrix A, and λ is how much A stretches it.",
      },
    ],
  },
  {
    id: "parametric-curves",
    title: "Parametric curves",
    paragraphs: [
      "A parametric curve gives each coordinate as a function of a third variable, usually called t and often read as time. Instead of asking which y goes with which x, you follow a point as it moves. This handles curves that loop back on themselves or run vertically, which no single function y = f(x) can describe.",
      "The circle is the simplest case. The cycloid is the path traced by a point on the rim of a rolling wheel. It answers two classic problems. Johann Bernoulli posed the brachistochrone problem in 1696: which curve takes a sliding bead from one point to another in the least time? The answer is the cycloid. Huygens had already shown that the cycloid is also the tautochrone. A bead released anywhere on an inverted cycloid reaches the bottom in the same time.",
      "The velocity of the moving point is the derivative of each coordinate with respect to t, and its length gives the speed. Integrating the speed over t gives the length of the curve.",
    ],
    equations: [
      {
        tex: t`x(t) = r\cos t,\quad y(t) = r\sin t`,
        label: "x of t equals r cosine t, y of t equals r sine t",
        note: "A circle of radius r, traced once as t runs from 0 to 2π.",
      },
      {
        tex: t`x(t) = r(t - \sin t),\quad y(t) = r(1 - \cos t)`,
        label:
          "x of t equals r times t minus sine t, y of t equals r times 1 minus cosine t",
        note: "The cycloid traced by a wheel of radius r.",
      },
      {
        tex: t`L = \int_a^b \sqrt{\dot{x}(t)^2 + \dot{y}(t)^2}\,dt`,
        label:
          "L equals the integral from a to b of the square root of x dot squared plus y dot squared, d t",
        note: "Arc length: the total distance the point travels.",
      },
    ],
  },
];

export const physicsTopics: Topic[] = [
  {
    id: "classical-mechanics",
    title: "Classical mechanics",
    paragraphs: [
      "Newton's Principia (1687) set out three laws of motion. A body keeps its state of rest or uniform motion unless a force acts on it. Force equals the rate of change of momentum, which for a constant mass is mass times acceleration. Every action has an equal and opposite reaction. Add his law of gravitation and the same few lines explain a falling apple, the tides and the orbits of the planets.",
      "Two quantities are conserved in any isolated system: momentum and energy. Energy moves between kinetic form (motion) and potential form (position in a field), but the total stays the same. These conservation laws often solve a problem faster than tracking every force.",
      "Classical mechanics still holds for anything much larger than an atom and much slower than light. Bridges, rockets and planetary probes are designed with it.",
    ],
    equations: [
      {
        tex: t`\mathbf{F} = m\mathbf{a}`,
        label: "F equals m a",
        note: "Newton's second law, for a constant mass.",
      },
      {
        tex: t`F = \frac{G m_1 m_2}{r^2}`,
        label: "F equals G m1 m2 over r squared",
        note: "Universal gravitation: the attraction between two masses a distance r apart.",
      },
    ],
  },
  {
    id: "lagrangian",
    title: "Lagrangian mechanics",
    paragraphs: [
      "In 1788 Joseph-Louis Lagrange published Mécanique analytique, which rebuilt Newton's mechanics without drawing forces at all. Every system has a Lagrangian, L, equal to kinetic energy minus potential energy. Of all the paths a system could take between two moments, it follows one for which the time integral of L, the action, is stationary. This is the principle of least action.",
      "The method's power is that you can use any coordinates that suit the problem, such as angles for a pendulum or distances along a wire. You write one scalar function and the Euler–Lagrange equation produces the equations of motion. Constraints that would need awkward forces in Newton's version simply disappear.",
      "In 1918 Emmy Noether proved that every continuous symmetry of the action gives a conserved quantity. Symmetry in time gives conservation of energy, symmetry in space gives momentum, and symmetry under rotation gives angular momentum. Modern particle physics is written in Lagrangians for this reason.",
    ],
    equations: [
      {
        tex: t`L = T - V,\qquad S = \int_{t_1}^{t_2} L\,dt`,
        label: "L equals T minus V; the action S is the integral of L from t1 to t2",
      },
      {
        tex: t`\frac{d}{dt}\frac{\partial L}{\partial \dot{q}} - \frac{\partial L}{\partial q} = 0`,
        label:
          "d by d t of partial L by partial q dot, minus partial L by partial q, equals zero",
        note: "The Euler–Lagrange equation, one for each coordinate q.",
      },
    ],
  },
  {
    id: "thermodynamics",
    title: "Thermodynamics",
    paragraphs: [
      "Thermodynamics grew out of the steam engine. Sadi Carnot asked in 1824 how much work an engine can get out of heat. He found that the answer depends only on the temperatures of the hot source and the cold sink, not on the working substance.",
      "The first law says energy is conserved: heat put into a system goes either into its internal energy or into work it does. The second law, in Clausius's form, says heat does not flow by itself from a colder body to a hotter one. Clausius introduced entropy in 1865, and the second law then says the entropy of an isolated system never decreases. The third law says entropy approaches a constant as temperature approaches absolute zero, and that zero cannot be reached in a finite number of steps.",
      "Boltzmann explained entropy by counting. The entropy of a state measures how many microscopic arrangements of atoms produce it. Disorder wins because there are vastly more ways to be disordered. His formula is carved on his tombstone in Vienna.",
    ],
    equations: [
      {
        tex: t`\Delta U = Q - W`,
        label: "delta U equals Q minus W",
        note: "First law: change in internal energy is heat added minus work done by the system.",
      },
      {
        tex: t`S = k_B \ln \Omega`,
        label: "S equals k B times the natural log of Omega",
        note: "Boltzmann's entropy: Ω is the number of microstates.",
      },
      {
        tex: t`\eta_{\text{max}} = 1 - \frac{T_C}{T_H}`,
        label: "eta max equals 1 minus T C over T H",
        note: "Carnot efficiency, with temperatures in kelvin.",
      },
    ],
  },
  {
    id: "relativity",
    title: "Relativity and E = mc²",
    paragraphs: [
      "Maxwell's equations give a single speed for light, about 299,792 kilometres per second, and do not say relative to what. In 1905 Einstein took two postulates: the laws of physics are the same for every observer in uniform motion, and every such observer measures the same speed of light. Everything else in special relativity follows from these two.",
      "The consequences go against intuition but have been measured many times. Moving clocks run slow, so muons made high in the atmosphere reach the ground before they decay. Moving rulers are shortened along the direction of motion. Two events that are simultaneous for one observer need not be simultaneous for another.",
      "Later in 1905 Einstein showed that a body's mass is a measure of its energy content. The energy released in nuclear fission and fusion, and the energy that makes the Sun shine, comes from small differences in mass. In 1915 he extended the theory to gravity. General relativity treats gravity as the curvature of spacetime. It predicted the bending of starlight, confirmed in 1919, and gravitational waves, first detected in 2015. Satellite navigation has to correct for both the special and general effects on its clocks.",
    ],
    equations: [
      {
        tex: t`E = mc^2`,
        label: "E equals m c squared",
        note: "The rest energy of a mass m.",
      },
      {
        tex: t`E^2 = (pc)^2 + (mc^2)^2`,
        label: "E squared equals p c squared plus m c squared, squared",
        note: "The full relation for a body with momentum p. Light has m = 0 and E = pc.",
      },
    ],
  },
  {
    id: "lorentz",
    title: "Lorentz transformations",
    paragraphs: [
      "Hendrik Lorentz wrote these equations down by 1904 to explain why experiments could not detect the Earth's motion through the supposed ether. Poincaré gave them their modern form and name. Einstein derived them from his two postulates and showed that they describe space and time themselves, not some effect of the ether.",
      "They convert the coordinates of an event as measured by one observer into those measured by a second observer moving at speed v along the x axis. The Lorentz factor γ is almost exactly 1 at everyday speeds, so the Galilean picture works fine for cars and aircraft. It grows without limit as v approaches c, which is why no massive object can reach light speed.",
      "Time dilation and length contraction both come from these equations. So does the rule for adding velocities, which never gives a result faster than light.",
    ],
    equations: [
      {
        tex: t`t' = \gamma\left(t - \frac{vx}{c^2}\right),\quad x' = \gamma(x - vt),\quad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}`,
        label:
          "t prime equals gamma times t minus v x over c squared; x prime equals gamma times x minus v t; gamma equals 1 over the square root of 1 minus v squared over c squared",
      },
      {
        tex: t`\Delta t = \gamma\,\Delta\tau`,
        label: "delta t equals gamma delta tau",
        note: "Time dilation: a clock's own elapsed time τ is shorter than the time measured by an observer it moves past.",
      },
    ],
  },
  {
    id: "quantum",
    title: "Quantum mechanics",
    paragraphs: [
      "At the scale of atoms, energy comes in discrete amounts and particles behave like waves. Quantum mechanics describes a system by a wavefunction, ψ. The wavefunction does not give a definite outcome. The square of its magnitude gives the probability of finding the particle at each place (Born, 1926).",
      "Schrödinger's equation (1926) says how the wavefunction changes in time. The Hamiltonian, H, is the operator for total energy. Solving the time-independent form for the hydrogen atom gives exactly the energy levels seen in its spectrum.",
      "Superposition follows from the equation being linear. If two wavefunctions are solutions, so is any weighted sum of them. A system can be in a combination of states that would be exclusive classically, and the different parts can interfere. The double-slit experiment shows this, and it is also the resource a quantum computer works with.",
      "Pauli's exclusion principle (1925) says no two electrons in an atom can share the same set of quantum numbers. That is why electrons fill shells instead of all dropping to the lowest level. It gives the periodic table its structure and makes matter take up space.",
      "In 1928 Dirac wrote an equation for the electron that was consistent with special relativity. Electron spin came out of it naturally rather than being added by hand. It also had solutions with negative energy, which Dirac interpreted as a new particle with the electron's mass and opposite charge. Carl Anderson found the positron in cosmic rays in 1932.",
    ],
    equations: [
      {
        tex: t`i\hbar\,\frac{\partial \psi}{\partial t} = \hat{H}\psi`,
        label: "i h bar partial psi by partial t equals H hat psi",
        note: "The time-dependent Schrödinger equation.",
      },
      {
        tex: t`|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\qquad |\alpha|^2 + |\beta|^2 = 1`,
        label:
          "psi equals alpha times state zero plus beta times state one, with alpha squared plus beta squared equal to one",
        note: "A superposition of two states. A measurement gives 0 with probability |α|² and 1 with probability |β|².",
      },
      {
        tex: t`(i\hbar\gamma^\mu\partial_\mu - mc)\,\psi = 0`,
        label: "i h bar gamma mu partial mu minus m c, acting on psi, equals zero",
        note: "The Dirac equation for a free electron.",
      },
    ],
  },
];

export const biochemistryTopics: Topic[] = [
  {
    id: "molecules-of-life",
    title: "The molecules of life",
    paragraphs: [
      "Biochemistry is the chemistry of living things. Almost all of it is carried out by four kinds of large molecule, built mostly from carbon, hydrogen, oxygen, nitrogen, phosphorus and sulfur, and almost all of it happens in water.",
      "Proteins are chains of amino acids, drawn from twenty standard kinds and joined by peptide bonds. The chain folds into a shape fixed by its sequence, and the shape decides the job: catalysis, structure, transport, signalling. Nucleic acids, DNA and RNA, are chains of nucleotides that store and carry genetic information. Carbohydrates, from glucose to starch and cellulose, store energy and build cell walls. Lipids are not polymers. They are grouped together because they avoid water. Fats store energy, and phospholipids form the double-layered membrane around every cell.",
      "Weak forces matter as much as strong ones. Hydrogen bonds hold the two strands of DNA together and keep a protein in its folded shape. They are weak enough to break and re-form at body temperature, which is what lets the molecules work.",
    ],
  },
  {
    id: "enzymes",
    title: "Enzymes and kinetics",
    paragraphs: [
      "Enzymes are catalysts, almost all of them proteins. They speed up reactions, often by factors of millions, without being used up and without changing where the reaction's equilibrium lies. They do this by lowering the activation energy. The substrate binds in a pocket called the active site, which holds it in a shape close to the transition state.",
      "In 1913 Leonor Michaelis and Maud Menten measured how the rate of an enzyme reaction depends on the amount of substrate. At low concentrations the rate rises almost in proportion. At high concentrations every enzyme molecule is busy and the rate levels off at a maximum, Vmax. The Michaelis constant, Km, is the substrate concentration at which the rate is half that maximum. A small Km roughly means the enzyme binds its substrate tightly.",
      "Cells control their enzymes constantly. Inhibitors can compete for the active site. Molecules binding elsewhere can change the enzyme's shape. A pathway's end product often switches off the enzyme at its first step, a form of feedback that stops the cell making more than it needs.",
    ],
    equations: [
      {
        tex: t`\mathrm{E} + \mathrm{S} \rightleftharpoons \mathrm{ES} \rightarrow \mathrm{E} + \mathrm{P}`,
        label:
          "enzyme plus substrate forms the enzyme-substrate complex, which gives enzyme plus product",
      },
      {
        tex: t`v = \frac{V_{\max}\,[\mathrm{S}]}{K_m + [\mathrm{S}]}`,
        label: "v equals V max times S, over K m plus S",
        note: "The Michaelis–Menten equation: v is the initial rate and [S] the substrate concentration.",
      },
    ],
  },
  {
    id: "atp",
    title: "ATP",
    paragraphs: [
      "Adenosine triphosphate is the cell's working supply of energy. It is an adenine base and a ribose sugar with a chain of three phosphate groups. Splitting off the last phosphate to give ADP releases about 30 kilojoules per mole under standard conditions, and more under the conditions inside a cell.",
      "Cells use that release to drive reactions that would not go on their own. They make the coupling direct: an enzyme transfers the phosphate to a substrate or a protein, changing its shape or reactivity. ATP powers muscle contraction, pumps ions across membranes and builds proteins and DNA.",
      "ATP is not stored in bulk. Each molecule is recycled many times a day, so the body turns over roughly its own weight in ATP daily. Fritz Lipmann proposed in 1941 that phosphate bonds act as a common currency of energy in the cell.",
    ],
    equations: [
      {
        tex: t`\mathrm{ATP} + \mathrm{H_2O} \rightarrow \mathrm{ADP} + \mathrm{P_i},\qquad \Delta G^{\circ\prime} \approx -30.5\ \mathrm{kJ\,mol^{-1}}`,
        label:
          "ATP plus water gives ADP plus phosphate, with a standard free energy change of about minus 30.5 kilojoules per mole",
      },
    ],
  },
  {
    id: "metabolism",
    title: "Metabolism: glycolysis and the Krebs cycle",
    paragraphs: [
      "Glycolysis splits one six-carbon glucose molecule into two three-carbon pyruvate molecules in ten enzyme steps. It happens in the cytoplasm and needs no oxygen. Two ATP are spent early on and four are made later, for a net gain of two ATP, along with two NADH, which carry electrons. Gustav Embden, Otto Meyerhof and Jakob Parnas worked out most of the pathway in the 1930s.",
      "When oxygen is present, pyruvate enters the mitochondrion and is converted to acetyl-CoA, losing one carbon as carbon dioxide. Acetyl-CoA feeds the citric acid cycle, which Hans Krebs described in 1937. Each turn joins a two-carbon acetyl group to four-carbon oxaloacetate and releases two CO₂. Oxaloacetate is regenerated at the end of the turn. The cycle makes little ATP directly. Its main output is NADH and FADH₂.",
      "Those carriers pass their electrons along the electron transport chain in the inner mitochondrial membrane, and oxygen is the final acceptor. The energy pumps protons across the membrane, and the protons flow back through ATP synthase, which makes ATP as they pass. Peter Mitchell proposed this chemiosmotic mechanism in 1961. Oxidative phosphorylation produces most of the roughly 30 ATP a cell gets from one glucose molecule. Without oxygen, cells fall back on fermentation and get only the two ATP from glycolysis.",
    ],
    equations: [
      {
        tex: t`\mathrm{C_6H_{12}O_6} + 6\,\mathrm{O_2} \rightarrow 6\,\mathrm{CO_2} + 6\,\mathrm{H_2O}`,
        label: "glucose plus six oxygen gives six carbon dioxide plus six water",
        note: "The overall balance of aerobic respiration. The cell takes it in dozens of steps, not one burn.",
      },
    ],
  },
  {
    id: "central-dogma",
    title: "DNA to RNA to protein",
    paragraphs: [
      "DNA is a double helix of two strands running in opposite directions. Its bases pair adenine with thymine and guanine with cytosine. Because each strand fixes the sequence of the other, a cell can copy its DNA by separating the strands and building a new partner for each. Watson and Crick proposed the structure in 1953, using X-ray photographs taken by Rosalind Franklin and Raymond Gosling. Meselson and Stahl showed in 1958 that copying works this way.",
      "In transcription, RNA polymerase reads one strand of a gene and builds a matching messenger RNA. RNA uses uracil where DNA uses thymine. In organisms with a nucleus, the message is then edited and exported from the nucleus.",
      "In translation, a ribosome reads the messenger RNA three bases at a time. Each three-base codon specifies one amino acid or a stop signal, and transfer RNAs bring the matching amino acids. Marshall Nirenberg and Heinrich Matthaei read the first codon in 1961: UUU codes for phenylalanine. By 1966 all 64 codons were known. The code is nearly the same in every living thing, which is strong evidence that all life shares one ancestor.",
      "Crick called this one-way flow of sequence information the central dogma (1958). Retroviruses such as HIV copy RNA back into DNA, but no known process turns a protein sequence back into nucleic acid.",
    ],
  },
];
