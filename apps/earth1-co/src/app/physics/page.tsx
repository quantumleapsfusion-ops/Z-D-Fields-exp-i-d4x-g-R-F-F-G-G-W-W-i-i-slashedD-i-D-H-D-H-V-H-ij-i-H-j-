import type { Metadata } from "next";

import { BlackHoleSimulator } from "@/components/BlackHoleSimulator";
import { DiracEquation } from "@/components/DiracEquation";
import { EnergyConverter } from "@/components/EnergyConverter";
import { LagrangianAction } from "@/components/LagrangianAction";
import { LorentzTransformation } from "@/components/LorentzTransformation";
import { PauliMatrices } from "@/components/PauliMatrices";
import { PoincareFeatured } from "@/components/PoincareFeatured";
import { SchrodingerEquation } from "@/components/SchrodingerEquation";
import { SpecialRelativityVisualizer } from "@/components/SpecialRelativityVisualizer";
import { SpacetimeCurvatureVisualizer } from "@/components/SpacetimeCurvatureVisualizer";
import { StringTheoryVisualizer } from "@/components/StringTheoryVisualizer";
import { SuperpositionVisualizer } from "@/components/SuperpositionVisualizer";
import { H2, Heading, Page, Prose, SectionFooter } from "@/components/library/parts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Physics & Gravity",
  description:
    "Simulations of gravitational physics, black holes, orbital mechanics, and relativistic effects.",
  alternates: { canonical: "/physics" },
  openGraph: {
    title: "Physics & Gravity — Earth 1",
    description:
      "Simulations of gravitational physics, black holes, orbital mechanics, and relativistic effects.",
    url: "/physics",
  },
};

export default function PhysicsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Physics & Gravity",
    description: "Interactive simulations of gravitational phenomena.",
    url: `${site.url}/physics`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.org, url: site.url },
  };

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Heading
        eyebrow="Library of human understanding"
        title="Physics & Gravity"
        line="Gravity shapes the universe at every scale, from falling apples to colliding black holes."
      />

      <Prose>
        <p>
          Gravity shapes the universe at every scale. From falling apples to collapsing
          stars, the same fundamental law governs how mass bends spacetime and moves
          bodies.
        </p>
      </Prose>

      <H2>Black Hole Simulator</H2>

      <BlackHoleSimulator />

      <H2>Superposition: The Core of Quantum Mechanics</H2>

      <SuperpositionVisualizer />

      <Prose>
        <h3 className="mt-8">What Is Superposition?</h3>
        <p>
          Superposition is a fundamental principle of quantum mechanics: a quantum system
          can exist in multiple states simultaneously until measured. A qubit is not just
          "0 or 1" before measurement—it genuinely occupies both states at once as a
          coherent superposition α|0⟩ + β|1⟩. This is not ignorance about which state it
          really is; the superposition itself is the real quantum state.
        </p>

        <p>
          The double-slit experiment elegantly demonstrates superposition's wave nature.
          Without detection, particles pass through both slits simultaneously, interfering
          with themselves like waves. But the moment we add a detector to measure which
          slit they pass through, superposition collapses—the particles are forced to
          choose one slit or the other, and interference disappears. This is not the
          observer "looking at" the system; measurement requires physical interaction that
          necessarily disturbs the quantum state.
        </p>

        <p>
          Superposition is not the particle "trying all answers at once" as a classical
          computer would. Rather, it's a genuine quantum state where all possibilities
          coexist as a single coherent entity. This coherence—the ability for different
          parts of the superposition to interfere—is what enables quantum computing and
          quantum simulation.
        </p>
      </Prose>

      <H2>The Schrödinger Equation: Wavefunctions and Quantization</H2>

      <SchrodingerEquation />

      <Prose>
        <h3 className="mt-8">The Wave Nature of Matter</h3>
        <p>
          The Schrödinger equation (iℏ∂ψ/∂t = Hψ) is the fundamental law governing quantum
          mechanics. It describes how the wavefunction ψ, which encodes all information
          about a quantum system, evolves over time. Unlike Newton's laws that predict
          particle trajectories, the Schrödinger equation predicts probability
          amplitudes—the wavefunction is not a real wave but a "matter wave" whose squared
          magnitude |ψ|² gives the probability density of finding the particle at a
          location.
        </p>

        <p>
          In confined systems like a particle in a box with infinite potential walls,
          something remarkable happens: only certain energies are allowed. The
          wavefunction must form a standing wave that "fits" inside the box, just as a
          vibrating guitar string can only resonate at specific frequencies. This is
          energy quantization—the origin of discrete energy levels in atoms. The energy
          formula E_n = n²ℏ²π²/(2mL²) depends on an integer n; you cannot have energy
          between these levels. This discreteness is purely quantum; no classical system
          behaves this way.
        </p>

        <p>
          Energy eigenstates—the stationary states of the system—have a special property:
          their probability density |ψ|² does not change over time. They oscillate only in
          phase, experiencing a phase factor e^(-iE_nt/ℏ). This is why atoms are stable:
          an electron in a ground state does not gradually spiral into the nucleus as
          classical electromagnetism would predict. Instead, it exists in a stationary
          state, forever cycling through its oscillating phase without radiating energy.
        </p>
      </Prose>

      <H2>The Dirac Equation: Spin and Antimatter</H2>

      <DiracEquation />

      <Prose>
        <h3 className="mt-8">Unifying Quantum Mechanics and Relativity</h3>
        <p>
          Paul Dirac's 1928 equation was the first successful marriage of quantum
          mechanics and special relativity. Unlike the Schrödinger equation, which treats
          space and time asymmetrically, the Dirac equation treats them on equal footing,
          respecting Einstein's relativistic symmetries. The equation governs the behavior
          of spin-½ fermions like electrons.
        </p>

        <p>
          The Dirac equation (iγ<sup>μ</sup>∂<sub>μ</sub> - m)ψ = 0 has a remarkable
          property: its solutions include states with both positive and negative energy.
          At first, Dirac interpreted negative energy as a mathematical curiosity. But in
          1931, he realized that if a "sea" of negative-energy states is filled, a hole in
          this sea would behave like a particle with positive energy and opposite charge:
          the antiparticle. For electrons, this is the positron, the antimatter
          counterpart.
        </p>

        <p>
          The energy gap between positive (electron) and negative (positron) branches is
          2mc², explaining why matter-antimatter pair creation requires high energies.
          When an electron falls from positive to negative energy, it radiates this energy
          as a photon—a process Dirac interpreted as the electron moving backward in time,
          or equivalently, as the positron moving forward in time.
        </p>

        <h3 className="mt-8">Spin-½: An Intrinsic Property</h3>
        <p>
          The Dirac equation naturally predicts that electrons are spin-½ particles.
          Unlike classical spinning objects, an electron's spin is an intrinsic quantum
          property that has no classical analog. A spin-½ particle has only two spin
          states: spin-up and spin-down, described by a two-component spinor wavefunction.
        </p>

        <p>
          The Dirac equation's prediction of antimatter was spectacularly confirmed when
          Carl Anderson discovered the positron in cosmic rays in 1932. This was the first
          prediction of a new particle made purely from theoretical considerations,
          marking a watershed moment: quantum field theory, where particles can be created
          and annihilated, emerged as the framework for understanding nature at its most
          fundamental level.
        </p>
      </Prose>

      <H2>Pauli Matrices and the Exclusion Principle</H2>

      <PauliMatrices />

      <Prose>
        <h3 className="mt-8">The Algebra of Spin</h3>
        <p>
          The Pauli matrices σ_x, σ_y, and σ_z are the quantum operators that measure spin
          along three orthogonal axes. They are 2×2 matrices that act on
          spinors—two-component quantum states representing spin-½ particles like
          electrons. Each Pauli matrix has eigenvalues of ±1, meaning spin measurement
          along any axis yields exactly two outcomes: spin-up or spin-down, with
          probability determined by the quantum state before measurement.
        </p>

        <p>
          Together with the identity matrix, the Pauli matrices form a basis for all 2×2
          Hermitian matrices and generate SU(2) rotations—the symmetry group of spin
          space. They satisfy elegant commutation relations: [σ_x, σ_y] = 2iσ_z, [σ_y,
          σ_z] = 2iσ_x, [σ_z, σ_x] = 2iσ_y. These commutation rules reveal the fundamental
          structure of quantum angular momentum and show why measuring spin along one axis
          disturbs the spin along others.
        </p>

        <h3 className="mt-8">Fermi, Pauli, and the Exclusion Principle</h3>
        <p>
          The Pauli exclusion principle states a profound fact: no two identical fermions
          can occupy the same quantum state. This is not a rule imposed from outside; it
          emerges from the fundamental antisymmetry of fermionic wavefunctions. When you
          exchange two fermions, their combined wavefunction must change sign: ψ(x₁, x₂) =
          −ψ(x₂, x₁). If two fermions were in the same quantum state, exchange would leave
          the wavefunction unchanged, violating this antisymmetry. Therefore, no two
          fermions can share an identical set of quantum numbers (n, l, m_l, m_s).
        </p>

        <p>
          This principle explains atomic structure, chemical bonding, and the stability of
          matter itself. Electrons fill atomic orbitals in shells, with at most two per
          orbital (spin-up and spin-down). Without the exclusion principle, all electrons
          would collapse into the lowest-energy state and atoms would be impossible. It
          explains the periodic table's patterns, why matter doesn't pass through matter,
          and even the degeneracy pressure that keeps neutron stars from collapsing under
          their own weight.
        </p>
      </Prose>

      <H2>String Theory: Vibrating Strings as Particles</H2>

      <StringTheoryVisualizer />

      <Prose>
        <h3 className="mt-8">The String Hypothesis</h3>
        <p>
          String theory proposes that all fundamental particles—electrons, quarks,
          photons, W and Z bosons, and gravitons—are not point particles but tiny
          vibrating strings. Different vibrational modes of the same string produce the
          different particles we observe. A string vibrating in its lowest mode appears as
          a photon; a higher mode vibration appears as a massive particle like a W boson.
        </p>

        <p>
          The theory requires 10 or 11 spacetime dimensions: the 4 we observe (3 spatial +
          1 time) plus 6 or 7 additional spatial dimensions compactified at the Planck
          scale (~10⁻³⁵ meters). These extra dimensions are invisible to us because they
          are rolled up so tightly that no probe could resolve them. String theory is
          often framed as theoretical: it remains unconfirmed experimentally and continues
          to evolve.
        </p>
      </Prose>

      <H2>The Principle of Least Action: Nature's Optimization</H2>

      <LagrangianAction />

      <Prose>
        <h3 className="mt-8">Action and the Lagrangian</h3>
        <p>
          The principle of least action states that physical systems evolve along paths
          that make the action S stationary—typically a minimum. The action is defined as
          S = ∫L dt, where L is the Lagrangian: the difference between kinetic and
          potential energy, L = T − V. This single principle, seemingly abstract and
          elegant, gives rise to all equations of motion in physics: Newton's laws for
          mechanics, Maxwell's equations for electromagnetism, and Einstein's equations
          for gravity.
        </p>

        <p>
          The Lagrangian formulation reveals a deep truth about nature: physical systems
          are "lazy" in a mathematical sense. A particle doesn't follow the shortest path
          between two points—it follows the path that minimizes the integral of (kinetic −
          potential) energy over time. For a ball thrown through the air, this
          action-minimizing path is a parabola, not a straight line. The parabola balances
          kinetic energy (speed matters) against potential energy (height matters) in
          exactly the right way to yield the trajectory we observe.
        </p>

        <p>
          From the action principle emerge the Euler-Lagrange equations, δS/δq = 0, which
          are the mathematical statement that the action is stationary. These partial
          differential equations encode the system's dynamics completely. This formulation
          unifies mechanics and field theory, explains conservation laws through Noether's
          theorem (symmetries ↔ conserved quantities), and provides the foundation for
          quantum field theory where paths are weighted by e^(iS/ℏ).
        </p>
      </Prose>

      <H2>Spacetime Curvature: Gravity as Geometry</H2>

      <SpacetimeCurvatureVisualizer />

      <Prose>
        <h3 className="mt-8">Einstein's Insight</h3>
        <p>
          Einstein's general relativity reveals that gravity is not a force pushing on
          objects, but rather the geometry of spacetime itself. Mass and energy curve
          spacetime, and objects naturally follow geodesics—the straightest available
          paths through this curved spacetime. What we perceive as gravitational
          attraction is actually the curvature of space and time around massive bodies.
        </p>

        <p>
          The Einstein field equations relate the curvature of spacetime (encoded in the
          metric tensor g<sub>μν</sub>) to the distribution of matter and energy (the
          stress-energy tensor T<sub>μν</sub>). In natural units where c = G = 1, they
          become: G<sub>μν</sub> = 8πT<sub>μν</sub>. This beautiful symmetry expresses a
          profound truth: matter tells spacetime how to curve, and spacetime tells matter
          how to move.
        </p>
      </Prose>

      <H2>Special Relativity: Time and Space Are Relative</H2>

      <SpecialRelativityVisualizer />

      <H2>Lorentz Transformations: Coordinates Between Reference Frames</H2>

      <LorentzTransformation />

      <Prose>
        <h3 className="mt-8">How Spacetime Coordinates Transform</h3>
        <p>
          The Lorentz transformation describes how coordinates of events change between
          two inertial reference frames in relative motion. If one observer measures an
          event at position x and time t, an observer moving at velocity v will measure
          that same event at position x' and time t' according to: x' = γ(x − vt) and t' =
          γ(t − vx/c²), where γ = 1/√(1 − v²/c²) is the Lorentz factor. These
          transformations are not derived from assumptions about how the world "ought" to
          work; they emerge directly from the requirement that the speed of light c is the
          same in all inertial frames.
        </p>

        <p>
          One profound consequence is the relativity of simultaneity: events that are
          simultaneous in one frame (Δt = 0) are not simultaneous in another frame moving
          relative to it. The Lorentz transformation reveals that spacetime is not a
          simple product of independent space and time—instead, motion mixes space and
          time coordinates. As velocity approaches light speed, the Lorentz factor γ
          diverges, revealing why no massive object can reach c: it would require infinite
          energy.
        </p>

        <p>
          The spacetime interval s² = −c²(Δt)² + (Δx)² is invariant under Lorentz
          transformations; all observers calculate the same interval between events. This
          invariant is the geometric distance in spacetime. Timelike intervals have s²
          &lt; 0 and define proper time; spacelike intervals have s² &gt; 0 and cannot be
          causally connected. The Lorentz transformation is the geometric rotation in
          spacetime, analogous to ordinary rotations in 3D space.
        </p>
      </Prose>

      <Prose>
        <h3 className="mt-8">The Light Clock Thought Experiment</h3>
        <p>
          Einstein's special relativity (1905) revealed that time and space are not
          absolute. The speed of light is the same for all observers, regardless of their
          motion. This simple fact has profound consequences: time runs slower in moving
          reference frames, and objects contract in their direction of motion. The "light
          clock" thought experiment elegantly demonstrates this. In a stationary frame,
          light bounces vertically between two mirrors. But in a frame where the clock
          moves horizontally, the light must travel a diagonal path—a longer
          distance—while still moving at speed c. Since time is defined by the rhythm of
          the clock, moving clocks must run slower to cover the longer diagonal path at
          the same speed of light.
        </p>

        <p>
          The Lorentz factor γ = 1/√(1 - v²/c²) quantifies these effects. Time dilates by
          a factor of γ, and lengths contract by a factor of √(1 - v²/c²). At everyday
          speeds these effects are imperceptible, but at relativistic speeds (approaching
          light speed) they become dramatic. A spacecraft traveling at 99.9% the speed of
          light would be contracted to a sliver of its rest length, and its occupants
          would age much more slowly than stationary observers.
        </p>

        <h3 className="mt-8">Schwarzschild Geometry</h3>
        <p>
          A non-rotating black hole in vacuum is described by the Schwarzschild metric,
          discovered by Karl Schwarzschild in 1916, just weeks after Einstein published
          general relativity. It shows that spacetime is fundamentally curved near any
          mass.
        </p>

        <p>
          The Schwarzschild radius r_s = 2GM/c² defines the event horizon. Within this
          radius, spacetime is so curved that no signal—not even light—can escape.
        </p>

        <h3 className="mt-8">Gravitational Lensing</h3>
        <p>
          Massive objects bend light rays passing nearby. This gravitational lensing has
          been observed to create multiple images of distant galaxies, to magnify faint
          supernovae, and most dramatically, to silhouette the event horizon of
          supermassive black holes against their glowing accretion disks.
        </p>

        <p>
          The bending angle θ ≈ 4GM/bc² depends on how close the light ray passes the
          mass, where b is the impact parameter. Near a black hole, lensing is extreme:
          light rays can be bent into spiraling orbits, or even orbit the black hole
          indefinitely at the photon sphere.
        </p>

        <h3 className="mt-8">The Photon Sphere</h3>
        <p>
          At radius r_ph = 3M (in units where c=G=1), light can orbit in a circular path.
          This photon sphere is unstable: any small perturbation sends the photon either
          inward to the event horizon or outward to infinity.
        </p>

        <p>
          The photon sphere is why black hole silhouettes are circled by a bright ring
          called the photon ring. Light from the accretion disk spirals around the black
          hole multiple times before escaping, creating a structured halo.
        </p>

        <h3 className="mt-8">Time Dilation</h3>
        <p>
          Einstein's theory predicts that time itself runs slower in strong gravity. An
          observer falling toward a black hole experiences nothing special at the event
          horizon (until tidal forces shred them), but to a distant observer, they appear
          to freeze at the event horizon, taking infinite time to cross.
        </p>

        <p>
          The time dilation factor dt/dτ = 1/√(1 - r_s/r) shows how proper time τ
          (experienced by the falling observer) differs from coordinate time t (measured
          by a distant observer). Near the event horizon, time nearly stops.
        </p>

        <h3 className="mt-8">Accretion Disks</h3>
        <p>
          When material falls toward a black hole, conservation of angular momentum forces
          it into an orbit, forming an accretion disk. Friction and turbulence convert
          rotational energy to heat. Near the event horizon, temperatures exceed millions
          of Kelvin, radiating X-rays and other high-energy photons—often the only way we
          detect black holes that would otherwise be invisible.
        </p>

        <h3 className="mt-8">Orbits and Kepler's Laws</h3>
        <p>
          Objects in circular orbits around a black hole obey Kepler's third law, but
          modified by relativistic effects. Orbits become unstable near the event horizon;
          the innermost stable circular orbit (ISCO) exists at r = 6M for a non-rotating
          black hole, just outside the photon sphere.
        </p>

        <p>
          The orbital speed v = √(GM/r) shows that orbits very close to the event horizon
          move at nearly the speed of light.
        </p>

        <h3 className="mt-8">Gravitational Waves</h3>
        <p>
          When two black holes merge, or when a neutron star spirals into a black hole,
          the violent distortion of spacetime radiates gravitational waves—ripples in
          spacetime itself. These waves carry away energy and angular momentum, causing
          the orbits to decay, eventually triggering a merger.
        </p>

        <p>
          The 2015 detection of gravitational waves by LIGO from two merging black holes
          was the first direct confirmation of waves predicted by Einstein a century
          earlier, and won the 2017 Nobel Prize.
        </p>

        <h3 className="mt-8">N-Body Gravity</h3>
        <p>
          All these effects scale. Galaxies orbit each other and merge. Stars orbit their
          black hole. Planets orbit stars. And moons orbit planets. The same
          inverse-square law, integrated over distances ranging from kilometers to
          billions of light-years, sculpts the visible universe.
        </p>
      </Prose>

      <H2>Poincaré: The Most Consequential Symmetry</H2>

      <PoincareFeatured />

      <Prose>
        <h3 className="mt-8">The Group That Unified Physics</h3>
        <p>
          Henri Poincaré, working at the turn of the 20th century, discovered that the
          symmetries of spacetime form a mathematical group: the Poincaré group P = O(1,3)
          ⋉ ℝ⁴. This group combines Lorentz transformations (rotations and boosts mixing
          space and time) with spacetime translations. Every event in spacetime can be
          mapped to another event under these symmetries, and the physical laws remain
          invariant. The Poincaré group is not merely an abstract mathematical
          structure—it is the deepest symmetry principle underlying all of modern physics,
          from quantum field theory to general relativity.
        </p>

        <p>
          The implications are staggering. Conservation laws spring directly from Poincaré
          symmetries: energy from time-translation invariance, momentum from
          space-translation invariance, and angular momentum from rotational invariance.
          These are not independent postulates but consequences of a single unified
          symmetry. Particles are best understood as irreducible representations of the
          Poincaré group—their mass and spin are quantum numbers labeling these
          representations. This perspective, developed by Wigner and others, shows that
          quantum field theory itself emerges from the requirement that particle creation
          and annihilation respect Poincaré symmetry.
        </p>

        <h3 className="mt-8">Chaos, Topology, and the Three-Body Problem</h3>
        <p>
          Beyond spacetime symmetries, Poincaré was a visionary in understanding chaos and
          topology. He realized that many systems, like the gravitational three-body
          problem, have no closed-form solutions yet still obey deterministic laws. Small
          changes in initial conditions lead to exponentially divergent trajectories - the
          butterfly effect. Poincaré quantified this with Lyapunov exponents (λ &gt; 0 for
          chaos) and invented the Poincaré section, a technique where periodic orbits are
          reduced to discrete points in a lower-dimensional surface. This reduction
          transforms continuous dynamics into map dynamics, revealing hidden structure:
          chaotic orbits fill fractal-like curves, periodic orbits appear as fixed points,
          and the global behavior becomes readable.
        </p>

        <p>
          The study of nonlinear dynamics and chaos—central to understanding turbulence,
          weather systems, and astronomical mechanics—was born from Poincaré's insights.
          His topological approach showed that geometry and qualitative behavior matter
          more than finding explicit solutions. This philosophy underpins modern dynamical
          systems theory and has revolutionized our understanding of complex systems from
          ecosystems to economies. Poincaré's legacy is not one result but a
          transformation in how we think about physical law: not as a machine with
          predictable outcomes, but as a rich tapestry of symmetries, bifurcations, and
          emergent structure. He is the bridge from classical to quantum, from determinism
          to chaos theory, and from mechanics to modern physics.
        </p>
      </Prose>

      <H2>E=mc²: Mass-Energy Equivalence</H2>

      <EnergyConverter />

      <SectionFooter current="physics" />
    </Page>
  );
}
