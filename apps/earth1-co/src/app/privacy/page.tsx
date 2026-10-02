import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy (v1)",
  description: "Privacy Policy for Earth 1 Coalescent",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-lg tracking-[0.2em] uppercase sm:text-2xl">
        Privacy Policy (privacy-v1)
      </h1>
      <p className="label mt-3 text-white/60">Draft — awaiting legal review</p>

      <div className="prose prose-invert mt-10 max-w-none text-sm leading-relaxed sm:text-base">
        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            1. Introduction
          </h2>
          <p className="mt-3">[Introduction to Earth 1 Coalescent privacy practices]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            2. Information We Collect
          </h2>
          <p className="mt-3">[Description of data collection practices]</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>[Collection method 1]</li>
            <li>[Collection method 2]</li>
            <li>[Collection method 3]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            3. How We Use Your Information
          </h2>
          <p className="mt-3">[Description of data use practices]</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>[Use case 1]</li>
            <li>[Use case 2]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            4. Data Security
          </h2>
          <p className="mt-3">[Description of security measures and encryption practices]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            5. Retention and Deletion
          </h2>
          <p className="mt-3">[Data retention policy and user deletion rights]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            6. Your Rights
          </h2>
          <p className="mt-3">[Description of user rights and how to exercise them]</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>[Right 1]</li>
            <li>[Right 2]</li>
            <li>[Right 3]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            7. Contact Us
          </h2>
          <p className="mt-3">
            For privacy concerns, contact{" "}
            <a
              href={`mailto:${site.founder.email}`}
              className="border-b border-white/30 text-white transition-colors hover:border-white"
            >
              {site.founder.email}
            </a>
          </p>
        </section>

        <section className="mb-8">
          <p className="text-xs text-white/40">Version: privacy-v1 | Last updated: [Date]</p>
        </section>
      </div>
    </>
  );
}
