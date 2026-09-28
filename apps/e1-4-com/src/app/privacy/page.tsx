import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata = { title: "Privacy" };

/**
 * GDPR / CCPA scaffolding. This page documents the controls the app actually implements; it is
 * not legal advice and should be reviewed by counsel before launch.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="text-chalk/80 mx-auto max-w-3xl px-5 py-16 font-sans leading-relaxed sm:px-8">
        <h1 className="font-display text-chalk text-4xl tracking-tight">Privacy</h1>
        <p className="mt-4">
          {site.name} is built by {site.org}. Your voice is yours. This page explains what
          we store and how you remove it.
        </p>

        <h2 className="label mt-10">What we store</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            Your account profile from the sign-in provider you chose (name, email, image).
          </li>
          <li>Voice Stream audio segments, their timestamps and their transcriptions.</li>
          <li>Infinity Chalkboard boards you save while signed in.</li>
          <li>Share links you create, and whether they have been revoked.</li>
        </ul>
        <p className="mt-3">
          Da Vinci and Gravity Board sessions are not persisted. Their live transcripts
          are sent to the configured speech-to-text and language-model providers only
          while you use them.
        </p>

        <h2 className="label mt-10">Your rights (GDPR / CCPA)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-chalk">Access &amp; portability</strong> — download
            everything from your{" "}
            <Link href="/profile" className="text-ochre">
              profile
            </Link>{" "}
            as JSON.
          </li>
          <li>
            <strong className="text-chalk">Erasure</strong> — deleting a segment, your
            whole stream, or your account hard-deletes database rows <em>and</em> stored
            audio/avatar files. There is no soft-delete or retention period.
          </li>
          <li>
            <strong className="text-chalk">Revocation</strong> — share links can be
            revoked at any time and stop working immediately.
          </li>
          <li>
            <strong className="text-chalk">No sale of personal information</strong> — we
            do not sell or share personal information for cross-context behavioural
            advertising.
          </li>
        </ul>

        <p className="text-dust mt-10 text-sm">
          Philosophy and contact:{" "}
          <a href={site.philosophyUrl} className="text-ochre" rel="noreferrer">
            {site.philosophyLabel}
          </a>
        </p>
      </article>
    </PageShell>
  );
}
