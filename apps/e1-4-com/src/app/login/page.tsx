import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@earth-one/ui";

import { PageShell } from "@/components/PageShell";
import { VoiceGate } from "@/features/voice-id/VoiceGate";
import { getCurrentUser } from "@/lib/supabase/server";
import { voiceIdStatus } from "@/lib/voice-id/status";

export const metadata: Metadata = {
  title: "Speak to enter",
  robots: { index: false },
};

function safeNext(next: string | string[] | undefined): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/stream";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, mode } = await searchParams;
  const destination = safeNext(next);
  if (await getCurrentUser()) redirect(destination);

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <Logo size={56} />
          <h1 className="font-display text-chalk text-4xl">Speak to enter</h1>
          <p className="text-dust text-sm">No email. No password. Just you, Earthling.</p>
        </div>
        <VoiceGate
          available={voiceIdStatus().available}
          next={destination}
          initialMode={mode === "enroll" ? "enroll" : "sign-in"}
        />
      </section>
    </PageShell>
  );
}
