import { PageHeading, PageShell } from "@/components/PageShell";
import { SuperpositionBoard } from "@/features/superposition/SuperpositionBoard";
import { requireUser } from "@/lib/auth/user";
import { flags } from "@/lib/flags";
import { features } from "@/lib/site";

export const metadata = { title: "Superposition · Ari" };

export default async function SuperpositionPage() {
  await requireUser("/superposition");
  const feature = features.find((item) => item.href === "/superposition")!;

  if (!flags.superposition) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <PageHeading
            dimension={feature.dimension}
            title={feature.title}
            tagline={feature.body}
          />
          <p className="text-chalk/70 font-sans text-sm">
            Superposition is switched off on this deployment. Set{" "}
            <code>NEXT_PUBLIC_FEATURE_SUPERPOSITION=true</code> to try it.
          </p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <PageHeading
          dimension={feature.dimension}
          title={feature.title}
          tagline={feature.body}
        />
        <SuperpositionBoard />
      </section>
    </PageShell>
  );
}
