import Link from "next/link";

import { Logo } from "@earth-one/ui";
import { getSessionUser } from "@/lib/auth/user";
import { enabledFeatures } from "@/lib/features";
import { site } from "@/lib/site";

import { Avatar } from "./Avatar";

export { Avatar };

export async function Nav() {
  const user = await getSessionUser().catch(() => null);

  return (
    <header className="border-chalk/10 bg-blackboard/85 sticky top-0 z-30 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <Logo size={28} />
          <span className="font-display text-lg tracking-tight">{site.name}</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="hidden items-center gap-5 md:flex">
            {enabledFeatures().map((f) => (
              <li key={f.href}>
                <Link href={f.href} className="label hover:text-chalk transition-colors">
                  {f.dimension}D {f.short}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={site.philosophyUrl}
            className="label hover:text-ochre transition-colors"
            rel="noreferrer"
          >
            {site.philosophyLabel}
          </a>
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2"
              aria-label="Your profile"
            >
              <Avatar image={user.image} name={user.name} size={28} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="border-chalk/20 text-chalk/90 hover:border-ochre hover:text-ochre rounded-full border px-3 py-1 font-sans text-sm transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
