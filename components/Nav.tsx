import Link from 'next/link';

import { Logo } from '@/components/Logo';
import { getSessionUser } from '@/lib/auth';
import { enabledFeatures } from '@/lib/features';
import { site } from '@/lib/site';

const SHORT_TITLES: Record<string, string> = {
  '/stream': 'Stream',
  '/davinci': 'Da Vinci',
  '/chalkboard': 'Chalkboard',
  '/gravity': 'Gravity',
};

export async function Nav() {
  const user = await getSessionUser().catch(() => null);

  return (
    <header className="sticky top-0 z-30 border-b border-chalk/10 bg-blackboard/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <Logo size={28} />
          <span className="font-display text-lg tracking-tight">{site.name}</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="hidden items-center gap-5 md:flex">
            {enabledFeatures().map((f) => (
              <li key={f.href}>
                <Link href={f.href} className="label transition-colors hover:text-chalk">
                  {SHORT_TITLES[f.href] ?? f.title}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={site.philosophyUrl}
            className="label transition-colors hover:text-ochre"
            rel="noreferrer"
          >
            {site.philosophyLabel}
          </a>
          {user ? (
            <Link href="/profile" className="flex items-center gap-2" aria-label="Your profile">
              <Avatar userId={user.id} image={user.image} name={user.name} size={28} />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="rounded-full border border-chalk/20 px-3 py-1 font-sans text-sm text-chalk/90 transition-colors hover:border-ochre hover:text-ochre"
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
  userId,
  image,
  name,
  size = 32,
  hasUpload,
}: {
  userId: string;
  image?: string | null;
  name?: string | null;
  size?: number;
  hasUpload?: boolean;
}) {
  const src = hasUpload ? `/api/avatar/${userId}` : image;
  const initial = (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-full border border-chalk/20 object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex items-center justify-center rounded-full border border-chalk/25 bg-chalk/5 font-display text-chalk"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}
