"use client";

import { usePathname } from "next/navigation";

import { AudioDock } from "@/components/AudioDock";
import { NavRail } from "@/components/NavRail";

const BARE_PREFIXES = ["/login", "/auth", "/s/", "/privacy"];
const IMMERSIVE_PREFIXES = ["/journey"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || BARE_PREFIXES.some((p) => pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => pathname.startsWith(p));
  const railed = !bare && !immersive;

  return (
    <>
      {railed ? <NavRail /> : null}
      <div className={railed ? "pb-16 md:pb-0 md:pl-[4.5rem]" : ""}>{children}</div>
      {immersive ? null : <AudioDock />}
    </>
  );
}
