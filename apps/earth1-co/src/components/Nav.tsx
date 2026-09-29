import { MonolithMark } from "@earth-one/ui";

import { nav, site } from "@/lib/site";

export function Nav() {
  return (
    <header className="page flex items-center justify-between py-6">
      <a
        href="#top"
        className="flex min-h-11 items-center gap-3"
        aria-label={`${site.name} home`}
      >
        <MonolithMark size={28} className="text-accent" title={site.org} />
        <span className="font-display hidden text-sm font-medium tracking-[0.24em] uppercase sm:inline">
          Earth 1
        </span>
      </a>
      <nav aria-label="Primary">
        <ul className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-text-2 hover:text-text flex min-h-11 items-center px-2.5 font-sans text-[13px] transition-colors sm:px-3 sm:text-sm"
                {...("external" in item && item.external
                  ? { rel: "noreferrer", target: "_blank" }
                  : {})}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
