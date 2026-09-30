import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { VoiceGate } from "@/features/portal/MicPortal";
import { getUserId } from "@/lib/auth/user";

export const metadata: Metadata = { robots: { index: false } };

/** Only same-site paths, so a crafted link cannot send a new session elsewhere. */
function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  if (await getUserId()) redirect(safeNext(next));
  return <VoiceGate next={safeNext(next)} />;
}
