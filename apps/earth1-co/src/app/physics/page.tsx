import type { Metadata } from "next";

import { BlackHoleSimulator } from "@/components/BlackHoleSimulator";
import { StringTheoryVisualizer } from "@/components/StringTheoryVisualizer";
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

      <SectionFooter current="physics" />
    </Page>
  );
}
