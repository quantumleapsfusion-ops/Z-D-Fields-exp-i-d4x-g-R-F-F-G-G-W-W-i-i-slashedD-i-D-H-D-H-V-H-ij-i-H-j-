"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@earth-one/ui";

import { enabledFeatures } from "@/lib/features";
import { site } from "@/lib/site";

const SHORT: Record<string, string> = {
  "/stream": "Streams",
  "/davinci": "Da Vinci",
  "/chalkboard": "Board",
  "/gravity": "Gravity",
};

const GLYPH: Record<string, React.ReactNode> = {
  "/stream": (
    <g strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 12v0M8 8v8M12 5v14M16 8v8M20 12v0" />
    </g>
  ),
  "/davinci": (
    <g strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l4-1 10-10-3-3L5 16z" />
      <path d="M13 8l3 3" />
    </g>
  ),
  "/chalkboard": (
    <g strokeWidth="1.6" strokeLinecap="round">
      <rect x="3.5" y="4.5" width="17" height="12" rx="1" />
      <path d="M8 20h8M12 16.5V20" />
    </g>
  ),
  "/gravity": (
    <g strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    </g>
  ),
};

/** Persistent left rail (md+) and bottom tab bar (mobile) for the app surfaces. */
export function NavRail() {
  const pathname = usePathname();
  const items = enabledFeatures();

  return (
    <>
      <nav
        aria-label="App surfaces"
        className="border-chalk/10 bg-blackboard/90 fixed inset-y-0 left-0 z-30 hidden w-[4.5rem] flex-col items-center border-r py-5 backdrop-blur md:flex"
      >
        <Link href="/" aria-label={`${site.name} home`} className="mb-6">
          <Logo size={28} />
        </Link>
        <ul className="flex flex-1 flex-col items-center gap-2">
          {items.map((f) => (
            <RailItem
              key={f.href}
              href={f.href}
              label={SHORT[f.href] ?? f.title}
              active={pathname.startsWith(f.href)}
              layoutId="rail-active"
            />
          ))}
        </ul>
        <Link
          href="/profile"
          className={`label hover:text-chalk transition-colors ${pathname.startsWith("/profile") ? "text-chalk" : ""}`}
        >
          You
        </Link>
      </nav>

      <nav
        aria-label="App surfaces"
        className="border-chalk/10 bg-blackboard/92 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur md:hidden"
      >
        <ul className="flex items-stretch justify-around">
          {items.map((f) => (
            <RailItem
              key={f.href}
              href={f.href}
              label={SHORT[f.href] ?? f.title}
              active={pathname.startsWith(f.href)}
              layoutId="tab-active"
              horizontal
            />
          ))}
        </ul>
      </nav>
    </>
  );
}

function RailItem({
  href,
  label,
  active,
  layoutId,
  horizontal,
}: {
  href: string;
  label: string;
  active: boolean;
  layoutId: string;
  horizontal?: boolean;
}) {
  return (
    <li className={horizontal ? "flex-1" : ""}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors ${
          active ? "text-chalk" : "text-dust hover:text-chalk"
        } ${horizontal ? "py-2.5" : "w-14"}`}
      >
        {active ? (
          <motion.span
            layoutId={layoutId}
            className="bg-chalk/8 absolute inset-0 rounded-lg"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        ) : null}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
          className="relative"
        >
          {GLYPH[href]}
        </svg>
        <span className="relative font-mono text-[0.6rem] tracking-[0.12em] uppercase">
          {label}
        </span>
      </Link>
    </li>
  );
}
