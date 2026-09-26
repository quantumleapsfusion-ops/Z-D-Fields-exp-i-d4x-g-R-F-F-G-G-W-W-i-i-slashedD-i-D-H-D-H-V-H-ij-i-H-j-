import Link from "next/link";

import { Logo } from "@earth-one/ui";
import { getSessionUser } from "@/lib/auth/user";
import { enabledFeatures } from "@/lib/features";
import { site } from "@/lib/site";

const SHORT_TITLES: Record<string, string> = {
  "/stream": "Stream",
  "/davinci": "Da Vinci",
  "/chalkboard": "Chalkboard",
  "/gravity": "Gravity",
};

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
                  {SHORT_TITLES[f.href] ?? f.title}
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

export function Avatar({
  image,
  name,
  size = 32,
}: {
  image?: string | null;
  name?: string | null;
  size?: number;
}) {
  const src = image;
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="border-chalk/20 rounded-full border object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="border-chalk/25 bg-chalk/5 font-display text-chalk flex items-center justify-center rounded-full border"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}
