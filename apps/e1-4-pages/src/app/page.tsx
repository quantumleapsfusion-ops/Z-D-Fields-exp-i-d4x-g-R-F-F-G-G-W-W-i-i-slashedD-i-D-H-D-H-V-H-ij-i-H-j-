import Link from "next/link";
import { Logo } from "@earth-one/ui";

import { features } from "../../../e1-4-com/src/lib/site";

const bars = [0.35, 0.6, 0.9, 0.5, 1, 0.45, 0.75, 0.3, 0.85, 0.55, 0.4, 0.7, 0.25];

export default function Home() {
  return (
    <>
      <header className="border-chalk/10 border-b">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="e1-4 home" className="flex items-center gap-3">
            <Logo size={30} />
            <span className="font-display text-xl">e1-4</span>
          </Link>
          <a
            href="https://earth1.co"
            className="label hover:text-ochre transition-colors"
          >
            earth1.co →
          </a>
        </nav>
      </header>
      <main>
        <section className="mx-auto max-w-5xl px-5 pt-24 pb-24 sm:px-8 sm:pt-36 sm:pb-32">
          <p className="label mb-6">Earth life-forms / e1-4</p>
          <h1 className="font-display max-w-4xl text-[3.5rem] leading-[0.98] tracking-tight sm:text-[6rem] lg:text-[7rem]">
            Greetings Earthling.
          </h1>
          <p className="text-ochre font-display mt-6 text-3xl sm:text-5xl">Think.</p>
          <p className="text-dust mt-7 max-w-2xl font-sans text-lg leading-relaxed sm:text-2xl">
            Four ways to speak. A world of ways to be heard.
          </p>
          <div aria-hidden="true" className="mt-12 flex h-12 items-center gap-1">
            {bars.map((height, i) => (
              <span
                key={i}
                className="animate-wave bg-chalk/70 w-1 origin-center rounded-full"
                style={{
                  height: `${Math.round(height * 100)}%`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        </section>
        <section id="four-ways-to-speak" className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="border-chalk/15 border-t pt-8">
            <p className="label">Explore</p>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl">Four ways to speak</h2>
          </div>
          <div className="divide-chalk/10 mt-10 divide-y">
            {features.map((feature) => (
              <article
                key={feature.title}
                className={
                  feature.emphasis
                    ? "border-ochre/40 bg-chalk/[0.03] my-8 rounded-lg border px-6 py-10 sm:px-9"
                    : "py-10"
                }
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <h3
                    className={`font-display tracking-tight ${feature.emphasis ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}
                  >
                    {feature.title}
                  </h3>
                  {feature.codenames && (
                    <p className="label sm:max-w-xs sm:text-right">{feature.codenames}</p>
                  )}
                </div>
                <p className="text-chalk/75 mt-5 max-w-3xl font-sans leading-relaxed sm:text-lg">
                  {feature.body}
                </p>
                {feature.keywords && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {feature.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="border-chalk/20 text-dust rounded-full border px-3 py-1 font-mono text-xs"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="label mt-6">Coming soon</p>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="font-display max-w-3xl text-2xl leading-snug sm:text-4xl">
            Built by Earth One Global Coalescent — global citizenship for all, one voice
            at a time
          </p>
          <a
            href="https://earth1.co"
            className="border-ochre text-ochre hover:text-chalk mt-8 inline-block border-b pb-1 font-sans transition-colors"
          >
            Discover earth1.co →
          </a>
        </section>
      </main>
      <footer className="border-chalk/10 border-t">
        <div className="text-dust mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-10 text-sm sm:px-8">
          <span>Earth One Global Coalescent / e1-4.com</span>
          <a href="https://earth1.co" className="hover:text-ochre transition-colors">
            earth1.co →
          </a>
        </div>
      </footer>
    </>
  );
}
