import { listBoardsAction, loadBoardAction } from "@/app/actions/boards";
import { PageHeading, PageShell } from "@/components/PageShell";
import { InfinityChalkboard } from "@/features/chalkboard/InfinityChalkboard";
import { emptyBoard } from "@/lib/chalkboard/types";
import { requireUser } from "@/lib/auth/user";
import { features } from "@/lib/site";

export const metadata = { title: "Infinity Chalkboard" };

export default async function ChalkboardPage() {
  await requireUser("/chalkboard");
  const feature = features.find((f) => f.href === "/chalkboard")!;
  const boards = await listBoardsAction();
  const latest = boards[0];
  const initial = latest
    ? { id: latest.id, ...(await loadBoardAction(latest.id)) }
    : { id: null, title: "Untitled board", doc: emptyBoard() };

  return (
    <PageShell footer={false}>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <PageHeading
          dimension={feature.dimension}
          title={feature.title}
          tagline={feature.body}
        />
        <InfinityChalkboard initialBoards={boards} initial={initial} />
      </section>
    </PageShell>
  );
}
