import { E14Mark } from "@earth-one/ui";

import { site } from "@/lib/site";

export function Footer() {
  const { flagship } = site;
  return (
    <footer id="contact" className="border-border scroll-mt-24 border-t">
      <div className="page py-20 sm:py-28">
        <p className="font-display text-[4rem] leading-none font-bold tracking-tight sm:text-[7rem]">
          Think.
        </p>

        <a
          href={flagship.url}
          rel="noreferrer"
          className="card hover:border-border-strong mt-14 flex items-center justify-between gap-6 p-6 transition-colors sm:p-8"
        >
          <div className="flex items-center gap-4">
            <E14Mark
              size={36}
              variant="mono"
              className="text-accent"
              title={flagship.name}
            />
            <div>
              <p className="font-display text-base font-medium">{flagship.name}</p>
              <p className="text-text-2 mt-1 font-sans text-sm">{flagship.pitch}</p>
            </div>
          </div>
          <span className="label text-accent shrink-0">{flagship.domain} →</span>
        </a>

        <div className="text-text-3 mt-16 flex flex-col gap-4 font-sans text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.org}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>{site.domain}</li>
            <li>
              <a
                href={flagship.url}
                rel="noreferrer"
                className="hover:text-text inline-flex min-h-11 items-center transition-colors"
              >
                {flagship.domain}
              </a>
            </li>
            <li className="font-mono">{site.contactEmail}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
