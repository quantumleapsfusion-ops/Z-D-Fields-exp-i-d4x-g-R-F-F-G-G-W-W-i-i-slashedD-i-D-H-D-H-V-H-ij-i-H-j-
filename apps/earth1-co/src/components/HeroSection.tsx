"use client";

import { motion } from "framer-motion";

import { site } from "@/lib/site";

import { Galaxy } from "./Galaxy";
import { Saturn } from "./Saturn";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** Text-free hero: a turning Milky Way, with Saturn drifting in the foreground. */
export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[92svh] items-center justify-center overflow-hidden">
      <h1 className="sr-only">
        {site.org}: {site.focus}
      </h1>
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease }}
      >
        <Galaxy className="h-full w-full" />
      </motion.div>
      <span
        data-spacetime-singularity
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-px w-px"
      />
      <motion.div
        className="absolute right-[3%] bottom-[6%] w-[14rem] sm:right-[6%] sm:w-[24rem]"
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1.8, ease, delay: 0.4 }}
      >
        <Saturn className="w-full drop-shadow-[0_0_40px_rgba(255,210,150,0.15)]" />
      </motion.div>
    </section>
  );
}
