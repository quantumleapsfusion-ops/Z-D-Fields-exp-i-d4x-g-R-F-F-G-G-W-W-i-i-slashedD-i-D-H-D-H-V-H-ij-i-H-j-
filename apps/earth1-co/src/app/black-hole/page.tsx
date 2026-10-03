import type { Metadata } from "next";

import { BlackHoleSim } from "@/components/explore/BlackHoleSim";
import { Heading, Page, Prose } from "@/components/library/parts";
import { site } from "@/lib/site";

const description =
  "Explore black-hole horizons, photon spheres, accretion disks, gravitational lensing, and time dilation in an interactive simulation.";

export const metadata: Metadata = {
  title: "Black Hole",
  description,
  alternates: { canonical: "/black-hole" },
  openGraph: { title: `Black Hole — ${site.name}`, description, url: "/black-hole" },
};

export default function BlackHolePage() {
  return (
    <Page wide>
      <Heading
        eyebrow="Gravity at its limit"
        title="Black Hole"
        line="A numerical playground around a simple, non-spinning black hole."
      />
      <Prose>
        <p>
          The event horizon is the boundary beyond which light cannot escape. Outside it,
          the photon sphere is where light can orbit on unstable circular paths. The
          innermost stable circular orbit (ISCO) marks the inner edge of a thin disk for a
          non-spinning black hole; real disks are more complicated.
        </p>
        <p>
          Hawking radiation is a theoretical quantum effect: black holes have a
          temperature and an extremely long evaporation time at astrophysical masses. The
          Event Horizon Telescope published its image of M87* in 2019 and Sagittarius A*
          in 2022. The bright ring is lensed emission around a dark shadow, not a
          photograph of the horizon itself.
        </p>
      </Prose>
      <BlackHoleSim />
    </Page>
  );
}
