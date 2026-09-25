import Link from 'next/link';

import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="25 September 2026">
      <p>
        {site.name} is operated by {site.org} (&ldquo;we&rdquo;). By signing in you agree to these
        terms, the <Link href="/privacy">privacy policy</Link> and the{' '}
        <Link href="/content-policy">content policy</Link>.
      </p>

      <h2>Who can use e1-4</h2>
      <ul>
        <li>
          You must be at least 16 years old. (Proposed minimum; the owner decides — see PLAN.md.)
        </li>
        <li>You sign in with a Google, Facebook or Microsoft account. There are no passwords.</li>
        <li>One account per person. Bots and automated posting are not permitted.</li>
      </ul>

      <h2>Your voice, your content</h2>
      <ul>
        <li>You own every recording you make. We store and process it only to run the service.</li>
        <li>
          You grant us a licence to store, transcribe, translate and stream your recordings to the
          people you choose (Private, Friends or Public). The licence ends when you delete the
          content.
        </li>
        <li>
          Da Vinci output (transcripts, translations, summaries, visuals) is machine-generated and
          labelled as such. It is never presented as your own words.
        </li>
        <li>
          Recording other people without their consent may be illegal where you live. Don&apos;t.
        </li>
      </ul>

      <h2>What we may do</h2>
      <ul>
        <li>Remove content that is illegal or that a court orders us to remove.</li>
        <li>Suspend accounts used for illegal activity, spam or abuse of the service.</li>
        <li>Change or shut down features with reasonable notice. Your data export always works.</li>
      </ul>

      <h2>Liability</h2>
      <p>
        The service is provided as-is during its pre-launch phase. To the extent the law allows, we
        are not liable for indirect loss. Nothing here limits rights you have as a consumer.
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
