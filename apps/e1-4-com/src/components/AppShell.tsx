"use client";

import { usePathname } from "next/navigation";

import { AudioDock } from "@/components/AudioDock";
import { DaVinciDrawer } from "@/components/DaVinciDrawer";
import { NavRail } from "@/components/NavRail";

const BARE_PREFIXES = ["/login", "/auth", "/s/", "/privacy"];

export function AppShell({
  children,
  llmReady,
}: {
  children: React.ReactNode;
  llmReady: boolean;
}) {
  const pathname = usePathname();
  const bare = pathname === "/" || BARE_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {bare ? null : <NavRail />}
      <div className={bare ? "" : "pb-16 md:pb-0 md:pl-[4.5rem]"}>{children}</div>
      <AudioDock />
      {bare ? null : <DaVinciDrawer llmReady={llmReady} />}
    </>
  );
}
