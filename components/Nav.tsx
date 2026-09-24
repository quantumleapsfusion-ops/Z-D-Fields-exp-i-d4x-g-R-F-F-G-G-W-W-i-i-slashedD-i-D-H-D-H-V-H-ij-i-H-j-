import Link from 'next/link';

import { GlyphMark } from '@/components/GlyphMark';
import { site } from '@/lib/site';

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-chalk/10 bg-blackboard/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <GlyphMark size={28} />
          <span className="font-display text-lg tracking-tight">{site.name}</span>
        </Link>
        <a
          href={site.philosophyUrl}
          className="label transition-colors hover:text-ochre"
          rel="noreferrer"
        >
          {site.philosophyLabel}
        </a>
      </nav>
    </header>
  );
}
