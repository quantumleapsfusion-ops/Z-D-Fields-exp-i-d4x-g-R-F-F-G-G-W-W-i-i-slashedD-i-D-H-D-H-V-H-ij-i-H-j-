import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@earth-one/ui";
import { PageShell } from "@/components/PageShell";
import {
  requestPasswordReset,
  signInWithPassword,
  signUpWithEmail,
} from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in" };

type Mode = "signin" | "signup" | "reset";

const COPY: Record<Mode, { title: string; tagline: string; submit: string }> = {
  signin: { title: "Sign in", tagline: "Welcome back, Earthling.", submit: "Sign in" },
  signup: {
    title: "Create account",
    tagline: "Sign up with your email.",
    submit: "Sign up",
  },
  reset: {
    title: "Reset password",
    tagline: "We'll email you a reset link.",
    submit: "Send reset link",
  },
};

const INPUT =
  "bg-board-2 border-line text-chalk placeholder:text-dust focus:border-ochre w-full rounded-(--radius-board) border px-4 py-3 text-sm outline-none transition";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, message, mode: modeParam } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  if (await getCurrentUser()) redirect(nextPath ?? "/profile");

  const mode: Mode =
    modeParam === "signup" || modeParam === "reset" ? modeParam : "signin";
  const copy = COPY[mode];
  const action =
    mode === "signup"
      ? signUpWithEmail
      : mode === "reset"
        ? requestPasswordReset
        : signInWithPassword;

  const hrefFor = (target: Mode) => {
    const params = new URLSearchParams({ mode: target });
    if (nextPath) params.set("next", nextPath);
    return `/login?${params.toString()}`;
  };

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <Logo size={48} />
          <div>
            <h1 className="font-display text-chalk text-3xl">{copy.title}</h1>
            <p className="text-dust text-sm">{copy.tagline}</p>
          </div>
        </div>

        {typeof error === "string" && (
          <p
            role="alert"
            className="border-ochre text-ochre mb-6 rounded-(--radius-board) border px-4 py-3 text-sm"
          >
            {error}
          </p>
        )}
        {typeof message === "string" && (
          <p
            role="status"
            className="border-line text-chalk mb-6 rounded-(--radius-board) border px-4 py-3 text-sm"
          >
            {message}
          </p>
        )}

        <form action={action} className="flex flex-col gap-3">
          {nextPath && <input type="hidden" name="next" value={nextPath} />}
          {mode === "signup" && (
            <label className="flex flex-col gap-1">
              <span className="label">Name (optional)</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                className={INPUT}
              />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="label">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={INPUT}
            />
          </label>
          {mode !== "reset" && (
            <label className="flex flex-col gap-1">
              <span className="label">Password</span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : undefined}
                required
                className={INPUT}
              />
            </label>
          )}
          <button
            type="submit"
            className="bg-ochre text-blackboard mt-2 w-full rounded-(--radius-board) px-4 py-3 text-sm font-medium transition hover:opacity-90"
          >
            {copy.submit}
          </button>
        </form>

        <div className="text-dust mt-6 flex flex-col gap-2 text-sm">
          {mode === "signin" && (
            <>
              <p>
                New here?{" "}
                <Link
                  href={hrefFor("signup")}
                  className="text-chalk hover:text-ochre underline"
                >
                  Create an account
                </Link>
              </p>
              <p>
                <Link
                  href={hrefFor("reset")}
                  className="text-chalk hover:text-ochre underline"
                >
                  Forgot your password?
                </Link>
              </p>
            </>
          )}
          {mode !== "signin" && (
            <p>
              Already have an account?{" "}
              <Link
                href={hrefFor("signin")}
                className="text-chalk hover:text-ochre underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
