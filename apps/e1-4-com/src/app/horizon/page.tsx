import { PageHeading, PageShell } from "@/components/PageShell";
import { EventHorizon } from "@/features/horizon/EventHorizon";
import { requireUser } from "@/lib/auth/user";
import { flags } from "@/lib/flags";
import { features } from "@/lib/site";

export const metadata = { title: "Event Horizon" };

export default async function HorizonPage() {
  await requireUser("/horizon");
  const feature = features.find((item) => item.href === "/horizon")!;

  if (!flags.eventHorizon) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <PageHeading
            dimension={feature.dimension}
            title={feature.title}
            tagline={feature.body}
          />
          <p className="text-chalk/70 font-sans text-sm">
            Event Horizon is switched off on this deployment. Set{" "}
            <code>NEXT_PUBLIC_FEATURE_EVENT_HORIZON=true</code> to try it.
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
        <EventHorizon />
      </section>
    </PageShell>
  );
}
