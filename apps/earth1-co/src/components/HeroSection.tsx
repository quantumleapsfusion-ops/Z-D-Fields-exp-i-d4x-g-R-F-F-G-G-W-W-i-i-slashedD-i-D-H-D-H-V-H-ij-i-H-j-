"use client";

import { Logo } from "@earth-one/ui";
import { motion } from "framer-motion";

import { site } from "@/lib/site";

import { SaturnRings } from "./SaturnRings";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** Text-free hero: the Earth One mark as the singularity, Saturn's rings drifting around it. */
export function HeroSection() {
  return (
    <section className="relative isolate mx-auto flex min-h-[88svh] max-w-5xl items-center justify-center px-5 sm:px-8">
      <h1 className="sr-only">
        {site.org}: {site.focus}
      </h1>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto w-[34rem] -translate-y-1/2 opacity-80 sm:w-[52rem]"
        initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
        animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
        transition={{ duration: 1.6, ease }}
      >
        <SaturnRings className="w-full animate-[saturn-drift_24s_ease-in-out_infinite]" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease }}
      >
        <span data-spacetime-singularity>
          <Logo size={140} brand="earth1" title={site.org} />
        </span>
      </motion.div>
    </section>
  );
}
