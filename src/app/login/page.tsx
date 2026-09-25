import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { signInWithOAuth } from "@/lib/auth/actions";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/providers";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  if (await getCurrentUser()) redirect(typeof next === "string" ? next : "/profile");

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-3">
        <Logo size={48} />
        <div>
          <h1 className="font-display text-chalk text-3xl">Sign in</h1>
          <p className="text-dust text-sm">Pick a door, Earthling.</p>
        </div>
      </div>

      {typeof error === "string" && (
        <p className="border-ochre text-ochre mb-6 rounded-(--radius-board) border px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {(Object.keys(OAUTH_PROVIDERS) as OAuthProvider[]).map((provider) => (
          <form key={provider} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={provider} />
            {typeof next === "string" && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              className="bg-board-2 border-line text-chalk hover:border-ochre w-full rounded-(--radius-board) border px-4 py-3 text-left text-sm transition"
            >
              Continue with {OAUTH_PROVIDERS[provider].label}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
