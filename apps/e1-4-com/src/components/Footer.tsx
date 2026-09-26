import Link from "next/link";

import { Logo } from "@earth-one/ui";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-chalk/10 border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <p className="text-dust font-sans text-sm">
            {site.org} / {site.domain}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="text-dust hover:text-ochre font-sans text-sm transition-colors"
          >
            Privacy
          </Link>
          <a
            href={site.philosophyUrl}
            rel="noreferrer"
            className="text-dust hover:text-ochre font-sans text-sm transition-colors"
          >
            {site.philosophyLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
