import type { Metadata } from "next";
import Link from "next/link";

import { SymbolGlossary } from "@/components/explore/SymbolGlossary";
import { Heading, Page, Prose } from "@/components/library/parts";
import { site } from "@/lib/site";

const description =
  "A searchable guide to Greek letters and the signs used in mathematics, physics, calculus, and quantum mechanics.";

export const metadata: Metadata = {
  title: "Symbols",
  description,
  alternates: { canonical: "/symbols" },
  openGraph: { title: `Symbols — ${site.name}`, description, url: "/symbols" },
};

export default function SymbolsPage() {
  return (
    <Page>
      <Heading
        eyebrow="A field guide to notation"
        title="Symbols"
        line="What every Greek letter and maths sign means."
      />
      <Prose>
        <p>
          A symbol can mean different things in different fields; each entry gives common
          meanings and an example rather than pretending notation is universal.
        </p>
        <p>
          Read the symbols in context with the{" "}
          <Link href="/equations" className="border-b border-white/40 hover:border-white">
            equations they help explain
          </Link>
          .
        </p>
      </Prose>
      <SymbolGlossary />
    </Page>
  );
}
