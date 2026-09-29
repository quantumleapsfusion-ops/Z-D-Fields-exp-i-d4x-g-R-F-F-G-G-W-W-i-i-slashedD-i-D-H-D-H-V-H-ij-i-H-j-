"use client";

import { motion } from "framer-motion";

import { site } from "@/lib/site";

import { SaturnRings } from "./SaturnRings";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function HeroSection() {
  return (
    <section className="relative isolate mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-8 sm:pt-28 sm:pb-28">
      <motion.div
        className="pointer-events-none absolute -top-6 -right-24 -z-10 w-[26rem] opacity-80 sm:-right-16 sm:w-[40rem]"
        initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
        animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
        transition={{ duration: 1.6, ease }}
      >
        <SaturnRings className="w-full animate-[saturn-drift_24s_ease-in-out_infinite]" />
      </motion.div>
      <motion.p
        className="label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        Earth One Global Coalescent
      </motion.p>
      <motion.h1
        className="font-display mt-6 text-[2.75rem] leading-[0.95] tracking-tight sm:text-[5rem] lg:text-[6.5rem]"
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
      >
        {site.focus}
      </motion.h1>
      <motion.p
        className="text-dust mt-8 max-w-2xl font-sans text-lg leading-relaxed sm:text-2xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
      >
        A coalescent, not a corporation. Earth One is a home for global citizenship —
        built on one premise: every person on Earth is a citizen of it, and the person
        speaking owns what they said. We hold the domains, the principles and the accounts
        — and stay out of the way.
      </motion.p>
      <motion.div
        className="chalk-rule mt-14"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.5 }}
        style={{ originX: 0 }}
      />
    </section>
  );
}
