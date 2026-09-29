import { redirect } from "next/navigation";

import { MicMark } from "@/components/MicMark";
import { PinBackdrop } from "@/features/codex/PinBackdrop";
import { signInWithOAuth } from "@/lib/auth/actions";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/providers";
import { getCurrentUser } from "@/lib/supabase/server";

const ICONS: Record<OAuthProvider, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        fill="#4285F4"
        d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2.1-2 3.2-4.9 3.2-8.2z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.7 14c-.2-.7-.3-1.3-.3-2s.1-1.4.3-2V7.1H2a11 11 0 0 0 0 9.8z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2 7.1L5.7 10C6.6 7.4 9.1 5.4 12 5.4z"
      />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.3 23v-8h2.7l.4-3.2h-3.1V9.8c0-.9.3-1.5 1.6-1.5h1.6V5.5c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4V12H7.6v3.1h2.6V23z"
      />
    </svg>
  ),
  azure: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  ),
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  if (await getCurrentUser()) redirect(typeof next === "string" ? next : "/");

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center gap-10 overflow-hidden bg-black">
      <PinBackdrop />
      <h1 className="sr-only">Sign in</h1>
      <MicMark className="relative h-32 w-32" />
      {typeof error === "string" ? (
        <p role="alert" className="sr-only">
          {error}
        </p>
      ) : null}
      <div className="relative flex gap-5">
        {(Object.keys(OAUTH_PROVIDERS) as OAuthProvider[]).map((provider) => (
          <form key={provider} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={provider} />
            {typeof next === "string" && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              aria-label={`Continue with ${OAUTH_PROVIDERS[provider].label}`}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_30px_rgba(0,0,0,0.9)] transition hover:scale-105"
            >
              {ICONS[provider]}
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
