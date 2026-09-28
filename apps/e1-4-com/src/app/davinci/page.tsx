import { PageHeading, PageShell } from "@/components/PageShell";
import { DaVinciApp } from "@/features/davinci/DaVinciApp";
import { getLanguageModel } from "@/lib/llm";
import { requireUser } from "@/lib/auth/user";
import { features, statusLabel } from "@/lib/site";

export const metadata = { title: "Da Vinci" };

/** Da Vinci — early access: live visuals depend on an LLM key; transcription always works. */
export default async function DaVinciPage() {
  await requireUser("/davinci");
  const feature = features.find((f) => f.href === "/davinci")!;

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <PageHeading
          title={feature.title}
          codenames={feature.codenames}
          tagline={feature.body}
          status={statusLabel[feature.status]}
        />
        <DaVinciApp llmReady={getLanguageModel("everyday") !== null} />
      </section>
    </PageShell>
  );
}
