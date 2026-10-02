import type { Metadata } from "next";

import { DoubleSlit } from "@/components/library/DoubleSlit";
import { SuperpositionVisualizer } from "@/components/SuperpositionVisualizer";
import {
  EquationBlock,
  H2,
  Heading,
  Page,
  PersonCard,
  Prose,
  SectionFooter,
  Timeline,
} from "@/components/library/parts";
import { equationById } from "@/lib/library/equations";
import { peopleIn } from "@/lib/library/people";
import { quantumMechanics as qm } from "@/lib/library/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: qm.title,
  description: qm.description,
  alternates: { canonical: `/${qm.slug}` },
  openGraph: {
    title: `${qm.title} — ${site.name}`,
    description: qm.description,
    url: `/${qm.slug}`,
  },
};

export default function QuantumMechanicsPage() {
  const people = peopleIn("quantum-mechanics");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: qm.title,
    description: qm.description,
    url: `${site.url}/${qm.slug}`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.org, url: site.url },
    about: people.map((p) => p.name),
  };

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Heading eyebrow="Library of human understanding" title={qm.title} line={qm.line} />
      <Prose>
        {qm.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </Prose>

      <nav
        aria-label="On this page"
        className="source mt-8 flex flex-wrap gap-x-5 gap-y-2"
      >
        <a href="#ideas">The ideas</a>
        <a href="#interpretations">Interpretations</a>
        <a href="#people">The people</a>
        <a href="#timeline">Timeline</a>
      </nav>

      <H2 id="ideas">The ideas, in plain language</H2>
      {qm.concepts.map((c) => (
        <section key={c.id} id={c.id} className="mt-12 scroll-mt-8">
          <h3 className="text-xl text-white sm:text-2xl">{c.title}</h3>
          <Prose>
            {c.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Prose>
          {c.equation && equationById.get(c.equation) ? (
            <EquationBlock equation={equationById.get(c.equation)!} compact />
          ) : null}
          {c.id === "wave-particle" ? <DoubleSlit /> : null}
        </section>
      ))}

      <H2>Superposition: Visualized</H2>
      <Prose>
        <p>
          Explore three fundamental demonstrations of quantum superposition: the Bloch
          sphere shows how a qubit exists in superposition until measured, the double-slit
          experiment reveals wave-particle duality and the collapse of superposition with
          observation, and wave interference shows how multiple states coexist and
          interfere.
        </p>
      </Prose>

      <SuperpositionVisualizer />

      <H2 id="interpretations">What does it mean? The main interpretations</H2>
      <Prose>
        <p>
          All of these agree on every experimental prediction made so far. They differ on
          what the theory says is real. Which is right is an open question, and serious
          physicists hold each of these views.
        </p>
      </Prose>
      <ul className="mt-8 space-y-6">
        {qm.interpretations.map((i) => (
          <li key={i.name} className="border border-white/20 p-5">
            <h3 className="text-xl">{i.name}</h3>
            <p className="source mt-1">{i.by}</p>
            <p className="mt-3 text-lg leading-relaxed text-white/85">{i.claim}</p>
            <p className="mt-3 text-base leading-relaxed text-white/60">
              <span className="text-white/80">The price: </span>
              {i.cost}
            </p>
          </li>
        ))}
      </ul>

      <H2 id="people">The people</H2>
      <Prose>
        <p>
          Each profile says who they were, what they found, and why it mattered.
          Quotations appear only where we could trace them to a book, letter or paper; the
          famous ones we could not trace are listed as such.
        </p>
      </Prose>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.slug} person={p} />
        ))}
      </ul>

      <H2 id="timeline">Timeline</H2>
      <Timeline entries={qm.timeline} />

      <SectionFooter current={qm.slug} />
    </Page>
  );
}
