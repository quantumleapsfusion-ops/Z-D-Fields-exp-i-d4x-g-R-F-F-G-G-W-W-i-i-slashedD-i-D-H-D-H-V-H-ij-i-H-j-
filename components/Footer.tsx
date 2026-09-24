import { GlyphMark } from '@/components/GlyphMark';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-chalk/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <GlyphMark size={22} />
          <p className="font-sans text-sm text-dust">
            {site.org} / {site.domain}
          </p>
        </div>
        <a
          href={site.philosophyUrl}
          rel="noreferrer"
          className="font-sans text-sm text-dust transition-colors hover:text-ochre"
        >
          {site.philosophyLabel}
        </a>
      </div>
    </footer>
  );
}
