"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { VoiceNavigator } from "@/components/VoiceNavigator";
import { enabledFeatures } from "@/lib/features";
import { site } from "@/lib/site";

export function NavRail() {
  const pathname = usePathname();
  const items = enabledFeatures();

  return (
    <>
      <nav
        aria-label="App surfaces"
        className="border-chalk/10 bg-blackboard fixed inset-y-0 left-0 z-30 hidden w-[4.5rem] flex-col items-center border-r py-5 md:flex"
      >
        <Link href="/" aria-label={`${site.name} home`} className="label mb-6">
          {site.name}
        </Link>
        <ul className="flex flex-1 flex-col items-center gap-2">
          {items.map((f) => (
            <RailItem
              key={f.href}
              href={f.href}
              dimension={f.dimension}
              label={f.short}
              active={pathname.startsWith(f.href)}
            />
          ))}
        </ul>
        <VoiceNavigator variant="rail" />
        <Link
          href="/profile"
          className={`label hover:text-chalk transition-colors ${pathname.startsWith("/profile") ? "text-chalk" : ""}`}
        >
          You
        </Link>
      </nav>

      <nav
        aria-label="App surfaces"
        className="border-chalk/10 bg-blackboard fixed inset-x-0 bottom-0 z-30 border-t md:hidden"
      >
        <ul className="flex items-stretch">
          {items.map((f) => (
            <RailItem
              key={f.href}
              href={f.href}
              dimension={f.dimension}
              label={f.short}
              active={pathname.startsWith(f.href)}
              horizontal
            />
          ))}
          <li className="flex-1">
            <VoiceNavigator variant="tab" />
          </li>
        </ul>
      </nav>
    </>
  );
}

function RailItem({
  href,
  dimension,
  label,
  active,
  horizontal,
}: {
  href: string;
  dimension: number;
  label: string;
  active: boolean;
  horizontal?: boolean;
}) {
  return (
    <li className={horizontal ? "flex-1" : ""}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-col items-center gap-1 px-1 py-2 text-center ${
          active ? "text-chalk" : "text-dust hover:text-chalk"
        } ${horizontal ? "w-full" : "w-14"}`}
      >
        <span className="font-mono text-[0.55rem] tracking-[0.08em]">{dimension}D</span>
        <span className="font-mono text-[0.58rem] tracking-[0.04em] uppercase">
          {label}
        </span>
      </Link>
    </li>
  );
}
