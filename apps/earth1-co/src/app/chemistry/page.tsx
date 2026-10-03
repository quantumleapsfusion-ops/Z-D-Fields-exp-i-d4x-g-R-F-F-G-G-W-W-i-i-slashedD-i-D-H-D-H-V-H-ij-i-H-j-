import type { Metadata } from "next";
import { sectionBySlug } from "@earth-one/content";

import { FieldPage } from "@/components/FieldPage";
import { PeriodicTable } from "@/components/PeriodicTable";
import { H2 } from "@/components/library/parts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chemistry",
  description: "The study of atomic bonds, reactions, and the transformation of matter.",
  alternates: { canonical: "/chemistry" },
  openGraph: {
    type: "article",
    title: "Chemistry — Earth 1",
    description: "The study of atomic bonds, reactions, and the transformation of matter.",
    url: "/chemistry",
  },
};

export default async function ChemistryPage() {
  const section = sectionBySlug.get("chemistry");
  if (!section) return null;

  return (
    <>
      <FieldPage section={section} />
      <div className="mt-16">
        <H2>Periodic Table of Elements</H2>
        <PeriodicTable />
      </div>
    </>
  );
}
