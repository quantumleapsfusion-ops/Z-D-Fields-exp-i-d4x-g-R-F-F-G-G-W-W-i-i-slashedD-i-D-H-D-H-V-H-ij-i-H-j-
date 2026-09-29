"use client";

import { motion } from "framer-motion";
import { CosmicMark } from "@earth-one/ui";

import { site } from "@/lib/site";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 pt-14 pb-20 sm:px-8 sm:pt-24 sm:pb-28 md:grid-cols-[auto_1fr] md:gap-16">
      <motion.div
        className="mx-auto md:mx-0"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease }}
      >
        <CosmicMark size={260} />
      </motion.div>
      <div>
        <motion.p
          className="wordmark text-[2.6rem] leading-none sm:text-[4rem] lg:text-[4.6rem]"
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          Earth One
        </motion.p>
        <motion.div
          className="rainbow-rule mt-5"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          style={{ originX: 0 }}
        />
        <motion.div
          className="text-dust mt-4 flex flex-wrap gap-x-2 font-sans text-xs tracking-[0.14em] sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
        >
          <h1 className="uppercase">{site.focus}</h1>
          <span aria-hidden="true">•</span>
          <span>
            {site.flagship.name} | {site.flagship.tagline}
          </span>
        </motion.div>
        <motion.p
          className="font-display silver-text mt-8 text-6xl sm:text-7xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.5 }}
        >
          Think.
        </motion.p>
        <motion.p
          className="text-dust mt-10 max-w-xl font-sans text-lg leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.6 }}
        >
          <span className="text-chalk">{site.tagline}</span> Earth One is a home for
          global citizenship — built on one premise: every person on Earth is a citizen of
          it, and the person speaking owns what they said. We hold the domains, the
          principles and the accounts — and stay out of the way.
        </motion.p>
      </div>
    </section>
  );
}
