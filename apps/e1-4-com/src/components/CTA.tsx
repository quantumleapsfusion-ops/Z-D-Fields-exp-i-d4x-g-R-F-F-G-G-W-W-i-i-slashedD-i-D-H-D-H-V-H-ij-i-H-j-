import Link from "next/link";

import { site } from "@/lib/site";

export function CTA() {
  return (
    <section className="border-border border-y">
      <div className="page flex flex-col gap-10 py-24 sm:py-32 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-[2.75rem] leading-[0.95] font-light tracking-tight sm:text-[4.5rem] lg:text-[5.5rem]">
            {site.band.statement}
          </p>
          <p className="text-text-2 font-display mt-6 text-xl font-light sm:text-2xl">
            {site.band.support}
          </p>
        </div>
        <Link href="/stream" className="pill bg-accent text-bg hover:bg-text shrink-0">
          {site.cta}
        </Link>
      </div>
    </section>
  );
}
