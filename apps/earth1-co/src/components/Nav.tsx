"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/research", title: "Research" },
  { href: "/papers", title: "Papers" },
  { href: "/notebooks", title: "Notebooks" },
  { href: "/lab-notes", title: "Lab Notes" },
  { href: "/learn", title: "Learn" },
  { href: "/about", title: "About" },
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
              aria-current={path === l.href ? "page" : undefined}
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
