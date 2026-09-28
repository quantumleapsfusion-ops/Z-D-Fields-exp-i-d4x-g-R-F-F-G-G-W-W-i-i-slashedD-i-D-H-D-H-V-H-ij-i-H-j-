"use server";

import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { OAUTH_PROVIDERS, type OAuthProvider } from "./providers";

function safeNextPath(next: FormDataEntryValue | null): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/profile";
}

/** Starts the OAuth flow. Provider credentials live in the Supabase dashboard. */
export async function signInWithOAuth(formData: FormData) {
  const provider = formData.get("provider");
  if (typeof provider !== "string" || !(provider in OAUTH_PROVIDERS)) {
    throw new Error(`Unsupported OAuth provider: ${String(provider)}`);
  }
  const next = safeNextPath(formData.get("next"));

  const supabase = await createClient();
  const callback = new URL("/auth/callback", publicEnv.siteUrl);
  callback.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as OAuthProvider,
    options: {
      redirectTo: callback.toString(),
      ...OAUTH_PROVIDERS[provider as OAuthProvider].options,
    },
  });
  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth_failed")}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
