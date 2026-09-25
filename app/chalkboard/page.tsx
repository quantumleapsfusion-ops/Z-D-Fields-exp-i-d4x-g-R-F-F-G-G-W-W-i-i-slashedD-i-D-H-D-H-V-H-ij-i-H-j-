import { listBoardsAction, loadBoardAction } from '@/app/actions/boards';
import { PageHeading, PageShell } from '@/components/PageShell';
import { InfinityChalkboard } from '@/features/chalkboard/InfinityChalkboard';
import { emptyBoard } from '@/lib/chalkboard/types';
import { requireUser } from '@/lib/require-user';
import { features, statusLabel } from '@/lib/site';

export const metadata = { title: 'Infinity Chalkboard' };

/** Infinity Chalkboard — 2D is production-ready; 3D/4D are flagged, experimental scaffolds. */
export default async function ChalkboardPage() {
  await requireUser('/chalkboard');
  const feature = features.find((f) => f.href === '/chalkboard')!;
  const boards = await listBoardsAction();
  const latest = boards[0];
  const initial = latest
    ? { id: latest.id, ...(await loadBoardAction(latest.id)) }
    : { id: null, title: 'Untitled board', doc: emptyBoard() };

  return (
    <PageShell footer={false}>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <PageHeading
          title={feature.title}
          codenames={feature.codenames}
          tagline={feature.body}
          status={statusLabel[feature.status]}
        />
        <InfinityChalkboard initialBoards={boards} initial={initial} />
      </section>
    </PageShell>
  );
}
