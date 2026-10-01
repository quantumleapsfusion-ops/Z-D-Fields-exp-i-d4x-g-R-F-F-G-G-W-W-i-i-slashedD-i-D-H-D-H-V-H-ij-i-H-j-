import type { FieldSection, Figure, Topic } from "@earth-one/content";
import { citableQuotes, lifespan } from "@earth-one/content";
import Link from "next/link";

import { H2, Heading, Page, Prose } from "@/components/library/parts";
import { Tex } from "@/components/Tex";
import { site } from "@/lib/site";

function FigureEntry({ figure }: { figure: Figure }) {
  const quotes = citableQuotes(figure.quotes);
  return (
    <article
      id={figure.slug}
      className="mt-14 scroll-mt-8"
      aria-labelledby={`${figure.slug}-name`}
    >
      <h3 id={`${figure.slug}-name`} className="text-2xl text-white sm:text-3xl">
        {figure.name}
      </h3>
      <p className="source mt-1">
        {lifespan(figure)} · {figure.field.join(", ")}
      </p>
      <ul className="mt-5 space-y-3 text-lg leading-[1.7] text-white/85">
        {figure.contributions.map((c) => (
          <li key={c.slice(0, 32)} className="border-l border-white/20 pl-4">
            {c}
          </li>
        ))}
      </ul>
      {quotes.map((q) => (
        <figure key={q.text.slice(0, 32)} className="mt-6 border-l border-white/50 pl-5">
          <blockquote className="text-xl leading-relaxed italic">
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <figcaption className="source mt-2">
            {q.source}
            {q.caveat ? <span className="block text-white/45">{q.caveat}</span> : null}
          </figcaption>
        </figure>
      ))}
    </article>
  );
}

function TopicSection({ topic }: { topic: Topic }) {
  return (
    <section aria-labelledby={topic.id}>
      <H2 id={topic.id}>{topic.title}</H2>
      <Prose>
        {topic.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </Prose>
      {topic.equations?.map((eq) => (
        <div key={eq.tex} className="my-6 border-l border-white/40 pl-5">
          <p className="overflow-x-auto py-1 text-xl sm:text-2xl">
            <Tex tex={eq.tex} label={eq.label} display />
          </p>
          {eq.note ? <p className="source mt-2">{eq.note}</p> : null}
        </div>
      ))}
    </section>
  );
}

/** A content-backed section page (chemistry, physics, biology, biochemistry, mathematics, global citizenship). */
export function FieldPage({ section }: { section: FieldSection }) {
  const figures = [...section.figures, ...(section.sub?.figures ?? [])];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: section.title,
    description: section.line,
    url: `${site.url}/${section.slug}`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.org, url: site.url },
    about: figures.map((f) => f.name),
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
        title={section.title}
        line={section.line}
      />
      <Prose>
        {section.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </Prose>
      {section.slug === "physics" ? (
        <p className="source mt-6">
          Continue to{" "}
          <Link
            href="/quantum-mechanics"
            className="border-b border-white/30 hover:border-white"
          >
            Quantum Mechanics
          </Link>{" "}
          and{" "}
          <Link
            href="/quantum-computing"
            className="border-b border-white/30 hover:border-white"
          >
            Quantum Computing
          </Link>
          .
        </p>
      ) : null}

      {section.topics?.length ? (
        <nav aria-label="On this page" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {section.topics.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="inline-block rounded-full border border-white/25 px-3 py-1 font-sans text-xs tracking-[0.08em] text-white/75 hover:border-white hover:text-white"
                >
                  {t.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#people"
                className="inline-block rounded-full border border-white/25 px-3 py-1 font-sans text-xs tracking-[0.08em] text-white/75 hover:border-white hover:text-white"
              >
                The people
              </a>
            </li>
          </ul>
        </nav>
      ) : null}

      {section.topics?.map((t) => (
        <TopicSection key={t.id} topic={t} />
      ))}

      <H2 id="people">The people</H2>
      {section.figures.map((f) => (
        <FigureEntry key={f.slug} figure={f} />
      ))}

      {section.sub ? (
        <section aria-labelledby={section.sub.id}>
          <H2 id={section.sub.id}>{section.sub.title}</H2>
          <Prose>
            {section.sub.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Prose>
          {section.sub.figures.map((f) => (
            <FigureEntry key={f.slug} figure={f} />
          ))}
        </section>
      ) : null}

      <p className="source mt-16 border-t border-white/20 pt-6">
        Quotations appear only when we could check them against a named source. Sayings we
        could not trace are kept out.
      </p>
    </Page>
  );
}
