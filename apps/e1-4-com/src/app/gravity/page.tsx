import { listBoardsAction, loadBoardAction } from "@/app/actions/boards";
import { PageHeading, PageShell } from "@/components/PageShell";
import { GravityChalkboard } from "@/features/gravity/GravityChalkboard";
import { requireUser } from "@/lib/auth/user";
import { flags } from "@/lib/flags";
import { features } from "@/lib/site";

export const metadata = { title: "Gravity Chalkboard" };

export default async function GravityPage() {
  const feature = features.find((item) => item.href === "/gravity")!;
  const heading = (
    <PageHeading
      dimension={feature.dimension}
      title={feature.title}
      tagline={feature.body}
    />
  );

  if (!flags.gravityChalkboard) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          {heading}
          <p className="text-chalk/70 font-sans text-sm">
            Gravity Chalkboard is switched off on this deployment. Set{" "}
            <code>NEXT_PUBLIC_FEATURE_GRAVITY_CHALKBOARD=true</code> to try it.
          </p>
        </section>
      </PageShell>
    );
  }

  await requireUser("/gravity");
  const boards = await listBoardsAction();
  const latest = boards[0];
  const initial = latest
    ? { id: latest.id, ...(await loadBoardAction(latest.id)) }
    : null;

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        {heading}
        <GravityChalkboard boards={boards} initial={initial} />
      </section>
    </PageShell>
  );
}
