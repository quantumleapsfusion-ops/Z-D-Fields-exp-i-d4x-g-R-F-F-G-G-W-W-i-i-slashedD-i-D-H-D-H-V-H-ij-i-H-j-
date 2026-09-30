import type { Metadata } from "next";
import Link from "next/link";

import { research } from "@/lib/research";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research",
  description: "Earth One research questions in quantum mechanics and quantum computing.",
};

export default function ResearchPage() {
  return (
    <main className="chalk-surface min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-6">
          <Link href="/" className="label hover:text-ochre">
            ← Earth One
          </Link>
          <a href={site.flagship.url} className="label hover:text-ochre">
            {site.flagship.domain} ↗
          </a>
        </nav>
        <header className="border-chalk/20 mt-24 border-b pb-16">
          <p className="label text-ochre">Research / open questions</p>
          <h1 className="font-display mt-6 max-w-3xl text-5xl leading-tight sm:text-7xl">
            Inquiry is part of the infrastructure.
          </h1>
          <p className="text-dust mt-8 max-w-2xl text-lg leading-relaxed">
            These are the subjects we are studying and the questions guiding that work.
            References lead to foundational material; no experimental results are claimed
            here.
          </p>
        </header>
        <div className="divide-chalk/20 divide-y">
          {research.map((area) => (
            <section key={area.id} id={area.id} className="scroll-mt-8 py-16">
              <span className="label text-ochre">{area.number} / research</span>
              <h2 className="font-display mt-3 text-4xl sm:text-5xl">{area.title}</h2>
              <p className="text-dust mt-6 max-w-2xl text-lg leading-relaxed">
                {area.question}
              </p>
              <ul className="mt-8 flex flex-wrap gap-3">
                {area.focus.map((topic) => (
                  <li
                    key={topic}
                    className="border-chalk/25 rounded-full border px-4 py-2 text-sm"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
              <a
                href={area.reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ochre hover:text-chalk mt-8 inline-block border-b border-current pb-1 text-sm"
              >
                Read the source: {area.reference.title} ↗
              </a>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
