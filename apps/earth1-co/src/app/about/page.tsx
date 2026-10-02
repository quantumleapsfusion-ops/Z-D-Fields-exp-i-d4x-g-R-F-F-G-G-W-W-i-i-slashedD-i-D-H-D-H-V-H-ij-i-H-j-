import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Earth 1 Lab",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        About
      </h1>

      <div className="mt-12 max-w-3xl space-y-12 text-left">
        {/* Mission */}
        <section>
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            Our Mission
          </h2>
          <p className="mt-4 text-base leading-relaxed">
            Earth 1 Lab is a research lab using AI and quantum computing to
            solve the equations of physics. We publish our work in the open,
            for everyone.
          </p>
        </section>

        {/* Founder */}
        <section>
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            Founder
          </h2>
          <p className="mt-4 text-base leading-relaxed">
            <span className="font-light">{site.founder.name}</span>
            <br />
            <span className="text-sm text-white/70">{site.founder.role}</span>
          </p>
          <blockquote className="mt-6 border-l border-white/10 pl-4 text-base italic text-white/70">
            {site.founder.inspiration.text}
            <span className="block mt-2 text-xs font-light not-italic text-white/50">
              — {site.founder.inspiration.author}
            </span>
          </blockquote>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            Contact
          </h2>
          <p className="mt-4 text-sm">
            <a
              href={`mailto:${site.founder.email}`}
              className="text-white hover:text-white/70 transition-colors underline"
            >
              {site.founder.email}
            </a>
          </p>
        </section>

        {/* Global Citizenship */}
        <section className="border-t border-white/10 pt-12">
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            Global Citizenship
          </h2>
          <p className="mt-4 text-base leading-relaxed">
            Every person on Earth is a citizen of it. We build Earth 1 Lab to
            serve all.
          </p>
        </section>
      </div>
    </>
  );
}
