import Link from 'next/link';

import { Logo } from '@/components/Logo';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-chalk/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <p className="font-sans text-sm text-dust">
            {site.org} / {site.domain}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="font-sans text-sm text-dust transition-colors hover:text-ochre"
          >
            Privacy
          </Link>
          <a
            href={site.philosophyUrl}
            rel="noreferrer"
            className="font-sans text-sm text-dust transition-colors hover:text-ochre"
          >
            {site.philosophyLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
