"use client";

import { motion } from "framer-motion";

import { site } from "@/lib/site";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function HeroSection() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-8 sm:pt-28 sm:pb-28">
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
        {site.tagline}
      </motion.h1>
      <motion.p
        className="text-dust mt-8 max-w-2xl font-sans text-lg leading-relaxed sm:text-2xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
      >
        The holding shell for a small set of platforms built on one premise: the person
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
