import Image from "next/image";

import { EquationEntry } from "@/components/EquationEntry";
import { HandArrow, HandUnderline } from "@/components/HandArrow";
import { PlaceholderFrame } from "@/components/PlaceholderFrame";
import { Spacetime } from "@/components/Spacetime";
import { cicero, equations, manuscript, site, tenets } from "@/lib/site";

/* Notebook grid: a narrow margin column for labels and notes, a reading measure, and a
   wider right column where figures and asides sit off-axis. */
const grid =
  "grid gap-y-6 lg:grid-cols-[8.5rem_minmax(0,36rem)_minmax(0,1fr)] lg:gap-x-10";

export default function HomePage() {
  return (
    <>
      <Spacetime className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />

      <div className="mx-auto max-w-[76rem] px-6 pb-24 sm:px-10 lg:px-14">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-8 sm:pt-10">
          <h1 className="wordmark">
            Earth 1 <span className="text-ink-2">Coalescent</span>
          </h1>
          <nav aria-label="Sections" className="label flex flex-wrap gap-x-6 gap-y-2">
            <a href="#cicero" className="hover:text-ink py-2">
              i. Cicero
            </a>
            <a href="#tenets" className="hover:text-ink py-2">
              ii. Three tenets
            </a>
            <a href="#equations" className="hover:text-ink py-2">
              iii. Two equations
            </a>
            <a href={site.flagship.url} className="hover:text-ink py-2" rel="noreferrer">
              e1-4.com ↗
            </a>
          </nav>
        </header>
        <div className="rule mt-4" />
        <p className="mono mt-2 flex flex-wrap justify-between gap-x-6">
          <span>working notes · homepage · draft 1</span>
          <span>rev. 2026 · earth1.co</span>
        </p>

        <main>
          {/* ------------------------------------------------------------ i. Cicero */}
          <section id="cicero" className={`${grid} mt-20 sm:mt-28`}>
            <aside className="lg:pt-2">
              <p className="label">i.</p>
              <p className="mono mt-4 hidden lg:block">
                the sentence every designer has pasted and nobody has read.
                <HandArrow variant="down-right" className="text-ink-3 mt-2 w-20" />
              </p>
            </aside>

            <div>
              <p className="label">Where “lorem ipsum” comes from</p>
              <blockquote
                lang="la"
                className="mt-5 text-[1.55rem] leading-[1.32] sm:text-[1.9rem]"
              >
                <p>{cicero.latin}</p>
              </blockquote>
              <p className="text-ink-2 mt-6 max-w-[34rem] italic">{cicero.english}</p>
              <p className="label mt-5">{cicero.citation}</p>

              <p className="mt-10 max-w-[34rem]">
                The internet filled space with words nobody was meant to read. The filler
                text in half the pages ever built is a mutilated copy of this passage — a
                Roman arguing that pain is bearable when it buys something worth having.
                We took that as an instruction.{" "}
                <span className="relative inline-block">
                  Earth 1 exists to reverse the filling.
                  <HandUnderline className="text-blueprint absolute -bottom-1 left-0 h-[10px] w-full" />
                </span>
              </p>
            </div>

            <figure className="lg:-mt-10 lg:justify-self-end lg:pl-6">
              <a
                href={manuscript.creditUrl}
                rel="noreferrer"
                className="block max-w-[22rem]"
              >
                <Image
                  src={manuscript.src}
                  alt={manuscript.alt}
                  width={manuscript.width}
                  height={manuscript.height}
                  sizes="(min-width: 1024px) 22rem, 80vw"
                  priority
                  className="border-rule w-full rotate-[0.6deg] border"
                />
              </a>
              <figcaption className="mono mt-3 max-w-[22rem]">
                fig. 1 — {manuscript.caption}
                <br />
                <span className="text-ink-3">{manuscript.credit}</span>
              </figcaption>
            </figure>
          </section>

          {/* ------------------------------------------------------ ii. Tenets */}
          <section id="tenets" className={`${grid} mt-28 sm:mt-36`}>
            <aside>
              <p className="label">ii.</p>
            </aside>
            <div className="lg:col-span-2">
              <p className="label">Three tenets, in the order they were written down</p>
              <ol className="mt-8 space-y-14">
                {tenets.map((t, i) => (
                  <li
                    key={t.title}
                    className={`grid gap-x-8 gap-y-3 sm:grid-cols-[3.5rem_minmax(0,32rem)_minmax(0,14rem)] ${
                      i === 1 ? "sm:ml-10" : ""
                    }`}
                  >
                    <span
                      role="img"
                      aria-label={t.glyphName}
                      className="text-ink-2 text-4xl leading-none sm:pt-1"
                    >
                      {t.glyph}
                    </span>
                    <div>
                      <h2 className="text-2xl leading-tight sm:text-3xl">
                        <span className="mono text-ink-3 mr-3">{i + 1}.</span>
                        {t.title}
                      </h2>
                      <p className="text-ink-2 mt-3">{t.body}</p>
                    </div>
                    <p className="mono text-ink-3 sm:border-rule sm:border-l sm:pt-3 sm:pl-4">
                      {t.margin}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* --------------------------------------------------- iii. Equations */}
          <section id="equations" className={`${grid} mt-28 sm:mt-36`}>
            <aside>
              <p className="label">iii.</p>
              <p className="mono mt-4 hidden lg:block">
                from the blackboard, not the typesetter.
                <HandArrow variant="curl" className="text-ink-3 mt-2 w-16" />
              </p>
            </aside>
            <div>
              <p className="label">Two equations that ignore borders</p>
              <ol className="mt-8 space-y-12">
                {equations.map((eq, i) => (
                  <EquationEntry key={eq.id} eq={eq} index={i} />
                ))}
              </ol>
            </div>
            <div className="lg:pt-16 lg:pl-4">
              <PlaceholderFrame
                id="chalk-psi-pi"
                needs="photograph of the chalk Ψπ mark on slate — dust, smudges and half-erased working left in"
                aspect="4 / 5"
                className="max-w-[18rem] -rotate-[0.8deg]"
              />
            </div>
          </section>

          {/* ------------------------------------------------------ iv. Motto */}
          <section id="motto" className={`${grid} mt-32 sm:mt-44`}>
            <aside>
              <p className="label">iv.</p>
            </aside>
            <div className="lg:col-span-2">
              <p className="max-w-[16ch] text-[2.6rem] leading-[1.05] sm:text-[4rem] lg:text-[5rem]">
                {site.motto}
              </p>
              <p className="text-ink-2 mt-8 max-w-[34rem]">
                Not a slogan; a boundary condition. Whatever we build has to still hold
                when the person on the other end was born on a different continent — or,
                in time, a different world.
              </p>
              <div className="mt-14 grid gap-8 sm:grid-cols-[minmax(0,26rem)_1fr]">
                <PlaceholderFrame
                  id="notebook-01"
                  needs="a spread from a working notebook, with margin notes and crossings-out"
                  aspect="3 / 2"
                  className="rotate-[0.4deg]"
                />
                <p className="mono text-ink-3 self-end">
                  <HandArrow variant="left" className="mb-2 w-20" />
                  photographs, not renders. real shadows.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-32 sm:mt-40">
          <div className="rule" />
          <div className={`${grid} mt-6`}>
            <p className="wordmark text-ink-2">Earth 1 Coalescent</p>
            <dl className="mono grid grid-cols-[6rem_1fr] gap-y-2">
              <dt className="text-ink-3">product</dt>
              <dd>
                <a href={site.flagship.url} rel="noreferrer" className="bp-underline">
                  {site.flagship.domain}
                </a>{" "}
                — {site.flagship.tagline}. You speak; it listens.
              </dd>
              <dt className="text-ink-3">contact</dt>
              <dd>{site.contactEmail}</dd>
              <dt className="text-ink-3">sources</dt>
              <dd>
                manuscript leaf and page grain: Ohio State University RBML, public domain.
                Full list in <span className="text-ink">docs/ASSETS.md</span>.
              </dd>
              <dt className="text-ink-3">©</dt>
              <dd>
                {site.org} · {site.domain}
              </dd>
            </dl>
            <p className="mono text-ink-3 lg:justify-self-end lg:text-right">
              motion on this page is computed
              <br />
              (orbit: leapfrog; lensing: α = 4GM/c²b)
              <br />
              and stops when the tab does.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
