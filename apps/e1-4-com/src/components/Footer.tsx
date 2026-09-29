import Link from "next/link";

import { E14Mark, MonolithMark } from "@earth-one/ui";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="page py-16 sm:py-24">
        <p className="font-display max-w-3xl text-2xl leading-snug font-light tracking-tight sm:text-[2.5rem]">
          {site.credit}
        </p>
        <a
          href={site.philosophyUrl}
          rel="noreferrer"
          className="card hover:border-border-strong mt-10 flex items-center justify-between gap-6 p-6 transition-colors sm:p-8"
        >
          <div className="flex items-center gap-4">
            <MonolithMark size={36} className="text-accent" title={site.org} />
            <div>
              <p className="font-display text-base font-medium">{site.philosophyLine}</p>
              <p className="text-text-2 mt-1 font-sans text-sm">
                A platform of {site.org}
              </p>
            </div>
          </div>
          <span className="label text-accent shrink-0">{site.philosophyLabel} →</span>
        </a>

        <div className="text-text-3 mt-14 flex flex-col gap-4 font-sans text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <E14Mark size={20} variant="mono" className="text-text-3" />
            <p>
              © {site.org} · {site.domain}
            </p>
          </div>
          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/privacy"
                className="hover:text-text inline-flex min-h-11 items-center transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <a
                href={site.philosophyUrl}
                rel="noreferrer"
                className="hover:text-text inline-flex min-h-11 items-center transition-colors"
              >
                {site.philosophyLabel}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
