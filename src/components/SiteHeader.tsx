import Link from "next/link";
import { Logo } from "@/components/Logo";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-3">
        <Logo size={36} />
        <span className="font-display text-chalk text-xl tracking-tight">e1-4</span>
        <span className="text-dust hidden text-xs sm:inline">earth life-forms</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link href="/profile" className="text-dust hover:text-chalk">
              Profile
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="border-line text-dust hover:border-ochre hover:text-ochre rounded-full border px-3 py-1"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="border-line text-chalk hover:border-ochre hover:text-ochre rounded-full border px-3 py-1"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
