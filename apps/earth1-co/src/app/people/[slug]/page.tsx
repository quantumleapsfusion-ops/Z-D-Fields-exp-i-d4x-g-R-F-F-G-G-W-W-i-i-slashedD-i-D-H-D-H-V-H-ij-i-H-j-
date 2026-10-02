import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  EquationLink,
  H2,
  Heading,
  Page,
  PersonLink,
  Prose,
} from "@/components/library/parts";
import { people, personBySlug } from "@/lib/library/people";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

function sectionLink(slug: string) {
  return slug === "quantum-mechanics"
    ? { href: "/quantum-mechanics", title: "Quantum Mechanics" }
    : { href: "/quantum-computing", title: "Quantum Computing" };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = personBySlug.get(slug);
  if (!p) return {};
  const description = `${p.name} (${p.lived}, ${p.country}): ${p.known} Who they were, what they found and why it mattered.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/people/${p.slug}` },
    openGraph: {
      type: "article",
      title: `${p.name} — ${site.name}`,
      description,
      url: `/people/${p.slug}`,
    },
  };
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const p = personBySlug.get(slug);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/people/${p.slug}`,
    mainEntity: {
      "@type": p.name.includes(" and ") || p.name.includes(", ") ? "Thing" : "Person",
      name: p.name,
      description: p.known,
      nationality: p.country,
    },
  };
  const related = (p.related ?? []).filter((r) => personBySlug.has(r));
  const quotes = (p.quotes ?? []).filter((q) => q.verified && q.source.trim());

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Heading
        eyebrow={p.sections.map((s) => sectionLink(s).title).join(" · ")}
        title={p.name}
        line={p.known}
      />
      <p className="source mt-6 text-center">
        {p.lived} · {p.country}
      </p>

      <H2>Who they were</H2>
      <Prose>
        <p>{p.who}</p>
      </Prose>

      <H2>What they found or built</H2>
      <Prose>
        {p.work.map((t) => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </Prose>

      <H2>Why it mattered</H2>
      <Prose>
        {p.mattered.map((t) => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </Prose>

      {quotes.length ? (
        <>
          <H2>In their own words</H2>
          {quotes.map((q) => (
            <figure
              key={q.text.slice(0, 24)}
              className="mt-6 border-l border-white/40 pl-5"
            >
              <blockquote className="text-xl leading-relaxed italic">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="source mt-2">
                {p.name.split(" and ")[0]}, {q.source}
                {q.caveat ? (
                  <span className="block text-white/45">{q.caveat}</span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </>
      ) : null}

      {p.notes?.length ? (
        <>
          <H2>Sayings we left out</H2>
          <Prose>
            {p.notes.map((t) => (
              <p key={t.slice(0, 24)} className="text-base text-white/65">
                {t}
              </p>
            ))}
          </Prose>
        </>
      ) : null}

      {p.equations?.length || p.ideas?.length ? (
        <>
          <H2>Equations and key ideas</H2>
          {p.equations?.length ? (
            <ul className="mt-5 space-y-3 text-lg">
              {p.equations.map((id) => (
                <li key={id}>
                  <EquationLink id={id} />
                </li>
              ))}
            </ul>
          ) : null}
          {p.ideas?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.ideas.map((idea) => (
                <li
                  key={idea}
                  className="rounded-full border border-white/25 px-3 py-1 font-sans text-xs tracking-[0.08em]"
                >
                  {idea}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      {related.length ? (
        <>
          <H2>Connected to</H2>
          <p className="mt-5 text-lg leading-loose">
            {related.map((r, i) => (
              <span key={r}>
                {i ? " · " : ""}
                <PersonLink slug={r} />
              </span>
            ))}
          </p>
        </>
      ) : null}

      <nav
        aria-label="Sections"
        className="mt-20 flex flex-wrap gap-6 border-t border-white/20 pt-8"
      >
        {p.sections.map((s) => (
          <Link key={s} href={sectionLink(s).href} className="label hover:text-white">
            ← {sectionLink(s).title}
          </Link>
        ))}
        <Link href="/equations" className="label hover:text-white">
          Equations
        </Link>
      </nav>
    </Page>
  );
}
