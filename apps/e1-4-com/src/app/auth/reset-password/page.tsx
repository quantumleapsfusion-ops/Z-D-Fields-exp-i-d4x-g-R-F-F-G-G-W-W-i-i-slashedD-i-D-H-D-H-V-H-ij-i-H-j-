import type { Metadata } from "next";
import { Logo } from "@earth-one/ui";
import { PageShell } from "@/components/PageShell";
import { updatePassword } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/auth/reset-password">) {
  await requireUser("/auth/reset-password");
  const { error } = await searchParams;

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <Logo size={48} />
          <h1 className="font-display text-chalk text-3xl">Set a new password</h1>
        </div>

        {typeof error === "string" && (
          <p
            role="alert"
            className="border-ochre text-ochre mb-6 rounded-(--radius-board) border px-4 py-3 text-sm"
          >
            {error}
          </p>
        )}

        <form action={updatePassword} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="label">New password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="bg-board-2 border-line text-chalk focus:border-ochre w-full rounded-(--radius-board) border px-4 py-3 text-sm transition outline-none"
            />
          </label>
          <button
            type="submit"
            className="bg-ochre text-blackboard mt-2 w-full rounded-(--radius-board) px-4 py-3 text-sm font-medium transition hover:opacity-90"
          >
            Update password
          </button>
        </form>
      </section>
    </PageShell>
  );
}
