import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@earth-one/ui";
import { PageShell } from "@/components/PageShell";
import { VoiceGate } from "@/features/voice-gate/VoiceGate";
import { safeNextPath } from "@/lib/auth/next-path";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Voice gate" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const destination = safeNextPath(next);
  if (await getCurrentUser()) redirect(destination);

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-10 flex items-center gap-3">
          <Logo size={48} />
          <div>
            <h1 className="font-display text-chalk text-3xl">Who goes there?</h1>
            <p className="text-dust text-sm">Your voice is the key, Earthling.</p>
          </div>
        </div>

        <VoiceGate next={destination} />

        <p className="text-chalk/50 mt-12 max-w-md font-sans text-xs leading-relaxed">
          e1-4 keeps no email address and no password. What it keeps is your voice name
          and a compact print of how you say it, so it can recognise you next time. Delete
          your account from your profile to forget both.
        </p>
      </section>
    </PageShell>
  );
}
