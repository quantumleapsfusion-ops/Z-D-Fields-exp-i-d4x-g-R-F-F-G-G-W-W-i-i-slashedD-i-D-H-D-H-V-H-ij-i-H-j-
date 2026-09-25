import Link from 'next/link';

import { site } from '@/lib/site';

const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/content-policy', label: 'Content policy' },
];

export function Footer() {
  return (
    <footer className="border-t border-chalk/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-sans text-sm text-dust">
          {site.name} is a product of{' '}
          <a
            href={site.orgUrl}
            rel="noreferrer"
            className="font-semibold text-chalk underline-offset-4 hover:underline"
          >
            {site.org}
          </a>
        </p>
        <ul className="flex flex-wrap items-center gap-5">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-sans text-sm text-dust underline-offset-4 transition-colors hover:text-chalk hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
