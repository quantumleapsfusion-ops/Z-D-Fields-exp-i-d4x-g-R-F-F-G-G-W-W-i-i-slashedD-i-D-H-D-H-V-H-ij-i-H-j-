"use client";

import { motion } from "framer-motion";
import { Logo } from "@earth-one/ui";

import { site } from "@/lib/site";

export function DomainBridge() {
  const { flagship } = site;
  return (
    <section className="mx-auto max-w-5xl px-5 pb-28 sm:px-8">
      <p className="label mb-4">Platforms</p>
      <motion.a
        href={flagship.url}
        rel="noreferrer"
        className="bg-chalk text-blackboard group relative block overflow-hidden rounded-[var(--radius-board)] p-8 sm:p-12"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={30} />
              <span className="font-display text-2xl tracking-tight">
                {flagship.name}
              </span>
              <span className="text-blackboard/60 font-mono text-xs tracking-[0.18em] uppercase">
                {flagship.tagline}
              </span>
            </div>
            <p className="mt-6 max-w-xl font-sans text-xl leading-snug sm:text-3xl">
              {flagship.pitch}
            </p>
          </div>
          <motion.span
            aria-hidden
            className="font-display text-4xl leading-none sm:text-6xl"
            initial={{ x: 0 }}
            whileHover={{ x: 6 }}
          >
            →
          </motion.span>
        </div>
        <p className="text-blackboard/60 mt-8 font-mono text-xs tracking-[0.18em] uppercase">
          Enter {flagship.domain}
        </p>
        <span
          aria-hidden
          className="bg-ochre/0 group-hover:bg-ochre/10 pointer-events-none absolute inset-0 transition-colors"
        />
      </motion.a>
    </section>
  );
}
