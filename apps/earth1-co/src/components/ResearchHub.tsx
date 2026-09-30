import Link from "next/link";

import { research } from "@/lib/research";
import { site } from "@/lib/site";

export function ResearchHub() {
  return (
    <section
      id="research"
      aria-labelledby="research-title"
      className="mx-auto max-w-5xl px-5 py-20 sm:px-8"
    >
      <div className="border-ochre/30 mb-10 border-t pt-8">
        <p className="label text-ochre">Earth One / motherboard</p>
        <h2 id="research-title" className="font-display mt-4 text-4xl sm:text-6xl">
          One place for what we build and what we ask.
        </h2>
        <p className="text-dust mt-5 max-w-2xl text-lg leading-relaxed">
          The products are experiments in speaking and listening. The research is a set of
          open questions, not a claim that the products run on quantum hardware.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href={site.flagship.url}
          className="border-ochre/40 bg-ochre/5 hover:bg-ochre/10 group flex min-h-72 flex-col rounded-lg border p-6 transition-colors"
        >
          <span className="label">00 / product</span>
          <h3 className="font-display mt-8 text-3xl">{site.flagship.domain}</h3>
          <p className="text-dust mt-3 leading-relaxed">
            A voice-led place to speak, share, and explore ideas through sound.
          </p>
          <span className="text-ochre mt-auto pt-8 text-sm">
            Enter the voice stream ↗
          </span>
        </a>
        {research.map((area) => (
          <Link
            key={area.id}
            href={`/research#${area.id}`}
            className="border-chalk/20 hover:border-ochre/50 group flex min-h-72 flex-col rounded-lg border p-6 transition-colors"
          >
            <span className="label">{area.number} / research</span>
            <h3 className="font-display mt-8 text-3xl">{area.title}</h3>
            <p className="text-dust mt-3 leading-relaxed">{area.question}</p>
            <span className="text-ochre mt-auto pt-8 text-sm">
              Explore the questions ↗
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
