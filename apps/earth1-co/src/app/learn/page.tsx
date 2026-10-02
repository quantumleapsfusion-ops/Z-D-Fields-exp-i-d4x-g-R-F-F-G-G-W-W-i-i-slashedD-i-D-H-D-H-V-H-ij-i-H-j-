import type { Metadata } from "next";
import Link from "next/link";

import { learn } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn",
  description: "Education sections at Earth 1 Lab",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Learn
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        Education and foundational knowledge.
      </p>

      <div className="mt-16 grid w-full max-w-4xl gap-12 text-left sm:grid-cols-2">
        {learn.map((section) => (
          <section
            key={section.slug}
            id={section.slug}
            aria-labelledby={`${section.slug}-title`}
          >
            <h2
              id={`${section.slug}-title`}
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              <Link
                href={`/learn/${section.slug}`}
                className="hover:text-white/70 transition-colors"
              >
                {section.title}
              </Link>
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              {section.line}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
