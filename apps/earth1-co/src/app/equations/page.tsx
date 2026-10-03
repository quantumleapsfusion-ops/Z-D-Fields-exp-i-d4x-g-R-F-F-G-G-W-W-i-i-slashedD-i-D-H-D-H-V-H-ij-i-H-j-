import type { Metadata } from "next";
import Link from "next/link";

import { EquationBlock, H2, Heading, Page, Prose } from "@/components/library/parts";
import { equations } from "@/lib/library/equations";
import { personBySlug } from "@/lib/library/people";
import { site } from "@/lib/site";

const description =
  "The equations of quantum mechanics and quantum computing, from Planck's E = hν to Shor's algorithm, each explained in plain language with the people who found them.";

export const metadata: Metadata = {
  title: "Equations",
  description,
  alternates: { canonical: "/equations" },
  openGraph: {
    title: `Equations — ${site.name}`,
    description: description,
    url: "/equations",
  },
};

const groups = [
  { slug: "quantum-mechanics", title: "Quantum Mechanics" },
  { slug: "quantum-computing", title: "Quantum Computing" },
] as const;

export default function EquationsPage() {
  return (
    <Page>
      <Heading
        eyebrow="Library of human understanding"
        title="Equations"
        line="Short sentences that hold up whole fields."
      />
      <Prose>
        <p>
          Each equation is written in plain characters and followed by what it says in
          words. The maths is only the shorthand. More equations arrive with each new
          section of the library.
        </p>
        <p>
          New to the notation? See{" "}
          <Link href="/symbols" className="border-b border-white/40 hover:border-white">
            Symbols: what every Greek letter and maths sign means
          </Link>
          .
        </p>
      </Prose>
      {groups.map((g) => (
        <section key={g.slug}>
          <H2 id={g.slug}>{g.title}</H2>
          {equations
            .filter((e) => e.sections[0] === g.slug)
            .map((e) => (
              <div key={e.id}>
                <EquationBlock equation={e} />
                <p className="source -mt-3 mb-8 pl-5">
                  {e.people.map((slug, i) => {
                    const p = personBySlug.get(slug);
                    return p ? (
                      <span key={slug}>
                        {i ? " · " : ""}
                        <Link
                          href={`/people/${slug}`}
                          className="border-b border-white/30 hover:border-white"
                        >
                          {p.name}
                        </Link>
                      </span>
                    ) : null;
                  })}
                </p>
              </div>
            ))}
        </section>
      ))}
    </Page>
  );
}
