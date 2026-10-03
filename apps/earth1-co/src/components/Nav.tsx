"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/lib/site";

const links = [
  { href: "/quantum-mechanics", title: "Quantum Mechanics" },
  { href: "/quantum-computing", title: "Quantum Computing" },
  ...site.pillars.map((p) => ({ href: `/${p.slug}`, title: p.title })),
  { href: "/equations", title: "Equations" },
  { href: "/knowledge-test", title: "Knowledge Test" },
  { href: "/symbols", title: "Symbols" },
  { href: "/periodic-table", title: "Periodic Table" },
  { href: "/planets", title: "Planets" },
  { href: "/black-hole", title: "Black Hole" },
  { href: "/founder", title: "Founder" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="Pages" className="px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-10">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={
                path === l.href || path.startsWith(`${l.href}/`) ? "page" : undefined
              }
              className="label transition-colors hover:text-white aria-[current=page]:text-white"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
