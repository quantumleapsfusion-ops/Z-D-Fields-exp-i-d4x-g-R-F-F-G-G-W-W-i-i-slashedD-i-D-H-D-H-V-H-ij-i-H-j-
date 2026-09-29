import Link from "next/link";

import { E14Mark } from "@earth-one/ui";
import { getSessionUser } from "@/lib/auth/user";
import { enabledFeatures } from "@/lib/features";
import { site } from "@/lib/site";

const SHORT_TITLES: Record<string, string> = {
  "/stream": "Voice Stream",
  "/davinci": "Da Vinci",
  "/chalkboard": "Chalkboard",
  "/gravity": "Gravity Board",
};

export async function Nav() {
  const user = await getSessionUser().catch(() => null);

  return (
    <header className="border-border bg-bg/85 sticky top-0 z-30 border-b backdrop-blur">
      <nav
        aria-label="Primary"
        className="page flex min-h-16 items-center justify-between gap-4 py-2 sm:min-h-20"
      >
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <E14Mark size={28} title={site.name} />
          <span className="font-display text-base font-medium tracking-tight">
            {site.name}
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center lg:flex">
            {enabledFeatures().map((f) => (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className="text-text-2 hover:text-text flex min-h-11 items-center px-3 font-sans text-sm transition-colors"
                >
                  {SHORT_TITLES[f.href] ?? f.title}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <Link
              href="/profile"
              className="flex min-h-11 min-w-11 items-center justify-center"
              aria-label="Your profile"
            >
              <Avatar image={user.image} name={user.name} size={32} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-text-2 hover:text-text flex min-h-11 items-center px-3 font-sans text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="pill bg-accent text-bg hover:bg-text ml-1 px-4 text-sm sm:px-5"
              >
                {site.earlyAccess}
              </Link>
            </>
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
      className="border-border-strong rounded-full border object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="border-border-strong bg-surface font-display text-text flex items-center justify-center rounded-full border"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}
