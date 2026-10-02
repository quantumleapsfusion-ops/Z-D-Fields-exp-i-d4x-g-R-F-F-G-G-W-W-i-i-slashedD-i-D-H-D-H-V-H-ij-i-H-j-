import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service (v1)",
  description: "Terms of Service for Earth 1 Coalescent",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-lg tracking-[0.2em] uppercase sm:text-2xl">
        Terms of Service (terms-v1)
      </h1>
      <p className="label mt-3 text-white/60">Draft — awaiting legal review</p>

      <div className="prose prose-invert mt-10 max-w-none text-sm leading-relaxed sm:text-base">
        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3">
            [Description of terms acceptance and binding nature of agreement]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            2. Use License
          </h2>
          <p className="mt-3">[Description of permitted and prohibited uses]</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>[Permitted use 1]</li>
            <li>[Prohibited use 1]</li>
            <li>[Prohibited use 2]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            3. Disclaimer of Warranties
          </h2>
          <p className="mt-3">[Disclaimer of warranty disclaimers and liability limitations]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            4. Limitations of Liability
          </h2>
          <p className="mt-3">[Description of liability limitations and exclusions]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            5. User Content and Conduct
          </h2>
          <p className="mt-3">[Description of user responsibilities and content policies]</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>[Content responsibility 1]</li>
            <li>[Conduct requirement 1]</li>
            <li>[Conduct requirement 2]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            6. Intellectual Property
          </h2>
          <p className="mt-3">[Description of IP ownership and user rights]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            7. Termination
          </h2>
          <p className="mt-3">[Description of termination rights and grounds]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            8. Governing Law and Jurisdiction
          </h2>
          <p className="mt-3">[Choice of law and jurisdiction clause]</p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-base tracking-[0.08em] uppercase sm:text-lg">
            9. Contact for Legal Notices
          </h2>
          <p className="mt-3">
            For legal notices, contact{" "}
            <a
              href={`mailto:${site.founder.email}`}
              className="border-b border-white/30 text-white transition-colors hover:border-white"
            >
              {site.founder.email}
            </a>
          </p>
        </section>

        <section className="mb-8">
          <p className="text-xs text-white/40">Version: terms-v1 | Last updated: [Date]</p>
        </section>
      </div>
    </>
  );
}
