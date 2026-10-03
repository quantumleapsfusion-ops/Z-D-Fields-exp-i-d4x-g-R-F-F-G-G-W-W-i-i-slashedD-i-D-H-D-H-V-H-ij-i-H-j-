import type { Metadata } from "next";

import { QubitLab } from "@/components/library/QubitLab";
import { SuperpositionVisualizer } from "@/components/SuperpositionVisualizer";
import {
  EquationBlock,
  H2,
  Heading,
  Page,
  PersonCard,
  PersonLink,
  Prose,
  SectionFooter,
  Timeline,
} from "@/components/library/parts";
import { equationById } from "@/lib/library/equations";
import { peopleIn } from "@/lib/library/people";
import { quantumComputing as qc } from "@/lib/library/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: qc.title,
  description: qc.description,
  alternates: { canonical: `/${qc.slug}` },
  openGraph: {
    title: `${qc.title} — ${site.name}`,
    description: qc.description,
    url: `/${qc.slug}`,
  },
};

export default function QuantumComputingPage() {
  const people = peopleIn("quantum-computing");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: qc.title,
    description: qc.description,
    url: `${site.url}/${qc.slug}`,
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
      <Heading eyebrow="Library of human understanding" title={qc.title} line={qc.line} />
      <Prose>
        {qc.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </Prose>

      <nav
        aria-label="On this page"
        className="source mt-8 flex flex-wrap gap-x-5 gap-y-2"
      >
        <a href="#how">How it works</a>
        <a href="#hardware">Hardware</a>
        <a href="#people">The people</a>
        <a href="#timeline">Timeline</a>
      </nav>

      <H2 id="how">How it works</H2>
      {qc.concepts.map((c) => (
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
          {c.id === "gates" ? <QubitLab /> : null}
        </section>
      ))}

      <H2>Qubits and Superposition</H2>
      <Prose>
        <p>
          The Bloch sphere visualization below shows how a qubit exists in superposition
          as a point on the sphere. When measured, it collapses to either the |0⟩ or |1⟩
          pole. This superposition—the coherent combination of states—is what gives
          quantum computers their power. The other visualizations show how this principle
          manifests in wave-particle duality and quantum interference.
        </p>
      </Prose>

      <SuperpositionVisualizer />

      <H2 id="hardware">Four ways to build one</H2>
      <Prose>
        <p>
          No one yet knows which approach will scale best. Each makes qubits from a
          different piece of the physical world, and each trades speed, accuracy and size
          differently.
        </p>
      </Prose>
      <ul className="mt-8 space-y-6">
        {qc.hardware.map((h) => (
          <li key={h.name} className="border border-white/20 p-5">
            <h3 className="text-xl">{h.name}</h3>
            <p className="mt-3 text-lg leading-relaxed text-white/85">{h.how}</p>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              <span className="text-white/90">Strengths: </span>
              {h.strengths}
            </p>
            <p className="mt-2 text-base leading-relaxed text-white/70">
              <span className="text-white/90">Challenges: </span>
              {h.challenges}
            </p>
            <p className="source mt-3">
              Pioneers:{" "}
              {h.people.map((slug, i) => (
                <span key={slug}>
                  {i ? ", " : ""}
                  <PersonLink slug={slug} />
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>

      <H2 id="people">The people</H2>
      <Prose>
        <p>
          From the first suggestion in 1980 to today&rsquo;s experiments. Several of them,
          such as Feynman, Zurek and the Bell-test experimenters, also appear in the
          Quantum Mechanics section.
        </p>
      </Prose>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.slug} person={p} />
        ))}
      </ul>

      <H2 id="timeline">Timeline</H2>
      <Timeline entries={qc.timeline} />

      <SectionFooter current={qc.slug} />
    </Page>
  );
}
