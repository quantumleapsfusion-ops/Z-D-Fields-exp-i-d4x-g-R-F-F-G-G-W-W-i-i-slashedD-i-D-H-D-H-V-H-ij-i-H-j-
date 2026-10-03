import type { Metadata } from "next";

import { PeriodicTable } from "@/components/explore/PeriodicTable";
import { Heading, Page, Prose } from "@/components/library/parts";
import { site } from "@/lib/site";

const description =
  "Explore all 118 elements in an interactive periodic table, with electron configurations, atomic weights, phases, and trends.";

export const metadata: Metadata = {
  title: "Periodic Table",
  description,
  alternates: { canonical: "/periodic-table" },
  openGraph: {
    title: `Periodic Table — ${site.name}`,
    description,
    url: "/periodic-table",
  },
};

export default function PeriodicTablePage() {
  return (
    <Page wide>
      <Heading
        eyebrow="Matter, arranged"
        title="Periodic Table"
        line="One hundred and eighteen elements, from hydrogen to oganesson."
      />
      <Prose>
        <p>
          The table follows the IUPAC layout: lutetium and lawrencium occupy group 3,
          while lanthanides and actinides are shown in separate rows. Atomic weights are
          abridged standard values; bracketed values are mass numbers for elements without
          stable isotopes.
        </p>
      </Prose>
      <PeriodicTable />
    </Page>
  );
}
