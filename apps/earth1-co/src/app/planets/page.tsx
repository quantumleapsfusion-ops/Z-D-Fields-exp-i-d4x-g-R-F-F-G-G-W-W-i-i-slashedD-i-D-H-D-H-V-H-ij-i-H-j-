import type { Metadata } from "next";

import { PlanetExplorer } from "@/components/explore/PlanetExplorer";
import { Heading, Page, Prose } from "@/components/library/parts";
import { site } from "@/lib/site";

const description =
  "Explore the eight planets with NASA Planetary Fact Sheet measurements, interactive illustrations, and comparisons.";

export const metadata: Metadata = {
  title: "Planets",
  description,
  alternates: { canonical: "/planets" },
  openGraph: { title: `Planets — ${site.name}`, description, url: "/planets" },
};

export default function PlanetsPage() {
  return (
    <Page wide>
      <Heading
        eyebrow="Our neighbourhood"
        title="Planets"
        line="Eight worlds, each with its own scale, weather, and rhythm."
      />
      <Prose>
        <p>
          The physical figures follow NASA&apos;s Planetary Fact Sheet (NSSDC). Orbital
          distances are semi-major axes; surface temperature is an approximate global
          mean. Moon counts are known moons; the count changes as more are found.
        </p>
      </Prose>
      <PlanetExplorer />
    </Page>
  );
}
