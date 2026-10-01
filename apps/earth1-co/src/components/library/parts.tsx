import Link from "next/link";

import { equationById } from "@/lib/library/equations";
import { personBySlug } from "@/lib/library/people";
import type { Equation, Person } from "@/lib/library/types";

/** The reading column: dark glass over the fixed starfield so long text stays legible. */
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-3xl rounded-sm bg-black/70 px-5 py-10 text-left font-serif backdrop-blur-sm sm:px-10">
      {children}
    </div>
  );
}

export function Heading({
  eyebrow,
  title,
  line,
}: {
  eyebrow?: string;
  title: string;
  line?: string;
}) {
  return (
    <header className="text-center">
      {eyebrow ? <p className="label">{eyebrow}</p> : null}
      <h1 className="font-display mt-4 text-xl tracking-[0.2em] uppercase sm:text-4xl">
        {title}
      </h1>
      {line ? (
        <p className="mx-auto mt-6 max-w-md font-sans text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
          {line}
        </p>
      ) : null}
    </header>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-16 scroll-mt-8 text-2xl leading-snug sm:text-3xl">
      {children}
    </h2>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 space-y-4 text-lg leading-[1.75] text-white/85">{children}</div>
  );
}

export function EquationBlock({
  equation,
  compact,
}: {
  equation: Equation;
  compact?: boolean;
}) {
  return (
    <div
      id={compact ? undefined : equation.id}
      className="my-6 scroll-mt-8 border-l border-white/40 pl-5"
    >
      <p className="font-sans text-xs tracking-[0.18em] text-white/55 uppercase">
        {equation.name} · {equation.year}
      </p>
      <p
        className="mt-2 text-2xl italic sm:text-3xl"
        aria-label={`${equation.name}: ${equation.formula}`}
      >
        {equation.formula}
      </p>
      {compact ? null : (
        <>
          <p className="mt-3 text-lg leading-relaxed text-white/80">{equation.explain}</p>
          {equation.symbols ? <p className="source mt-2">{equation.symbols}</p> : null}
        </>
      )}
    </div>
  );
}

export function EquationLink({ id }: { id: string }) {
  const eq = equationById.get(id);
  if (!eq) return null;
  return (
    <Link
      href={`/equations#${eq.id}`}
      className="inline-block border-b border-white/40 pb-0.5 text-white/80 hover:text-white"
    >
      {eq.name}: <span className="italic">{eq.formula}</span>
    </Link>
  );
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <li>
      <Link
        href={`/people/${person.slug}`}
        className="group block h-full border border-white/20 p-5 transition-colors hover:border-white/70"
      >
        <span className="text-xl leading-snug group-hover:underline group-hover:underline-offset-4">
          {person.name}
        </span>
        <span className="source mt-1 block">
          {person.lived} · {person.country}
        </span>
        <span className="mt-3 block text-base leading-relaxed text-white/75">
          {person.known}
        </span>
      </Link>
    </li>
  );
}

export function PersonLink({
  slug,
  children,
}: {
  slug: string;
  children?: React.ReactNode;
}) {
  const p = personBySlug.get(slug);
  if (!p) return <>{children}</>;
  return (
    <Link
      href={`/people/${slug}`}
      className="border-b border-white/40 hover:border-white"
    >
      {children ?? p.name}
    </Link>
  );
}

export function Timeline({
  entries,
}: {
  entries: { year: string; text: string; person?: string }[];
}) {
  return (
    <ol className="mt-6 space-y-3 border-l border-white/25 pl-5">
      {entries.map((e) => (
        <li key={e.year + e.text} className="relative">
          <span
            className="absolute top-2.5 -left-[1.6rem] h-1.5 w-1.5 rounded-full bg-white"
            aria-hidden="true"
          />
          <span className="font-sans text-sm tracking-[0.12em] text-white/60">
            {e.year}
          </span>
          <p className="text-lg leading-snug text-white/85">
            {e.text}
            {e.person ? (
              <>
                {" "}
                <Link
                  href={`/people/${e.person}`}
                  className="source border-b border-white/30 hover:border-white"
                >
                  {personBySlug.get(e.person)?.name.split(" and ")[0] ?? "profile"}
                </Link>
              </>
            ) : null}
          </p>
        </li>
      ))}
    </ol>
  );
}

const ORDER = [
  { href: "/quantum-mechanics", title: "Quantum Mechanics" },
  { href: "/quantum-computing", title: "Quantum Computing" },
] as const;

/** Previous/next between library sections, plus the equations. */
export function SectionFooter({ current }: { current: string }) {
  const i = ORDER.findIndex((s) => s.href === `/${current}`);
  const other = ORDER[(i + 1) % ORDER.length];
  return (
    <nav
      aria-label="More in the library"
      className="mt-20 flex flex-wrap justify-between gap-4 border-t border-white/20 pt-8"
    >
      <Link href={other.href} className="label hover:text-white">
        Next: {other.title} →
      </Link>
      <Link href="/equations" className="label hover:text-white">
        All equations
      </Link>
    </nav>
  );
}
