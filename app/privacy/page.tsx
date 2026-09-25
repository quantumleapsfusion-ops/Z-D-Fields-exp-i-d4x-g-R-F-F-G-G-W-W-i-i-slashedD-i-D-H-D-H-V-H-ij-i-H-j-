import Link from 'next/link';

import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata = { title: 'Privacy' };

/**
 * GDPR / UK GDPR / CCPA baseline. Documents the controls the app actually implements
 * (see lib/privacy/hard-delete.ts). Draft until reviewed by counsel.
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="25 September 2026">
      <p>
        {site.name} is built by {site.org}. Your voice is yours. Voice is personal data, and can be
        biometric data, so we treat it with care: this page explains what we store, why, and how you
        remove it.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          Your profile from the sign-in provider you chose (name, email, image) and your handle.
        </li>
        <li>Voice Stream audio segments, their timestamps and their transcriptions.</li>
        <li>Da Vinci output derived from your voice: translations, summaries, visuals.</li>
        <li>Infinity Chalkboard boards you save.</li>
        <li>Share links you create, and whether they have been revoked.</li>
        <li>Your privacy choices (default visibility, cookie consent).</li>
      </ul>

      <h2>What we never do</h2>
      <ul>
        <li>
          <strong>No voiceprints.</strong> We do not build speaker-identification models of you
          without a separate, explicit opt-in.
        </li>
        <li>
          <strong>No sale</strong> of personal information, and no cross-context behavioural
          advertising.
        </li>
        <li>
          <strong>No audio or transcripts in analytics.</strong> Product analytics see events, never
          content.
        </li>
      </ul>

      <h2>Processors</h2>
      <p>
        Audio is encrypted at rest in our object store and served only through short-lived signed
        URLs. Transcription and Da Vinci features send audio or text to a speech-to-text and a
        language-model provider under contract; they do not train on your data. The current
        providers are listed in the repository&apos;s <code>.env.example</code> and will be named
        here before launch.
      </p>

      <h2>Cookies</h2>
      <p>
        One essential cookie keeps you signed in. Optional cookies (sign-up measurement for our ads)
        load only after you choose &ldquo;Allow all&rdquo; in the banner. You can change your choice
        by clearing site data.
      </p>

      <h2>Your rights (GDPR / UK GDPR / CCPA)</h2>
      <ul>
        <li>
          <strong>Access &amp; portability</strong> — download everything from{' '}
          <Link href="/settings">Settings</Link> as JSON (a zip with audio in open formats is
          planned).
        </li>
        <li>
          <strong>Destroy all my voice data</strong> — in Settings. Hard-deletes every audio file,
          transcription, derived Da Vinci output and share link from primary storage immediately.
          Backups are purged within <strong>30 days</strong>. Caches and CDN copies are invalidated
          at the same time. You receive an email when it is complete.
        </li>
        <li>
          <strong>Delete account</strong> — everything above, plus your profile and avatar. There is
          no soft-delete or retention period on primary storage.
        </li>
        <li>
          <strong>Revocation</strong> — share links can be revoked at any time and stop working
          immediately.
        </li>
      </ul>

      <h2>Age</h2>
      <p>
        {site.name} is for people aged 16 and over (proposed; the owner decides). We do not
        knowingly collect data from younger children and will delete it on request.
      </p>

      <h2>Contact</h2>
      <p>
        {site.org} —{' '}
        <a href={site.orgUrl} rel="noreferrer">
          {site.orgLabel}
        </a>
      </p>
    </LegalPage>
  );
}
