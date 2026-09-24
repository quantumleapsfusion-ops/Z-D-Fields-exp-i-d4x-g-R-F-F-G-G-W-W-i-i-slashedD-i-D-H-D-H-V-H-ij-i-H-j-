import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Sign in" },
];

type AppShellProps = {
  user: User | null;
  children: ReactNode;
};

export default function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            e1-4 <span className="text-sky-500">App</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <span className="text-zinc-500 dark:text-zinc-400">
                {user.email}
              </span>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
