import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata = { title: 'Content policy' };

export default function ContentPolicyPage() {
  return (
    <LegalPage title="Content policy" updated="25 September 2026">
      <p>
        {site.name} is a place to speak freely. We do not remove lawful speech for being offensive,
        unpopular or emotionally intense. The only removals we make are the ones the law requires,
        and we keep those separate from any opinion about what you said.
      </p>

      <h2>What we remove</h2>
      <ul>
        <li>
          <strong>Child sexual abuse material.</strong> Removed immediately and reported to the
          relevant authority (NCMEC in the US; the IWF / local police elsewhere), as the law
          requires.
        </li>
        <li>
          <strong>Content a court orders us to remove</strong>, limited to the jurisdiction and
          scope of the order. We publish the number of orders received.
        </li>
        <li>
          <strong>Other illegal content</strong> where a valid legal notice identifies it: for
          example credible threats of violence or copyrighted audio uploaded without permission.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>No removal for opinion, tone, politics, religion or taste.</li>
        <li>No algorithmic down-ranking of lawful speech. The Listen feed is chronological.</li>
        <li>No shadow-bans. If we act on your content, we tell you and say why.</li>
      </ul>

      <h2>Your controls</h2>
      <ul>
        <li>Block and mute anyone. Blocked people cannot hear or reach you.</li>
        <li>Choose Private, Friends or Public for every recording.</li>
        <li>Report illegal content from any voice note. Reports go to a human, not a filter.</li>
      </ul>

      <h2>Appeals</h2>
      <p>
        If we remove something of yours, you can appeal. A different person reviews the appeal.
        Every removal and every appeal is written to an audit log.
      </p>
    </LegalPage>
  );
}
