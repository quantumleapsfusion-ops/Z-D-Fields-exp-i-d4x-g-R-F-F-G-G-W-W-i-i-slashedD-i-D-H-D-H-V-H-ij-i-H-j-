"use client";

import { usePathname } from "next/navigation";

import { AudioDock } from "@/components/AudioDock";
import { DaVinciDrawer } from "@/components/DaVinciDrawer";
import { NavRail } from "@/components/NavRail";

/** Routes that render as full pages (marketing, auth, public shares) rather than app surfaces. */
const BARE_PREFIXES = ["/login", "/auth", "/s/", "/privacy"];

/**
 * Client shell around every page: the persistent nav rail on app routes and the global audio
 * dock everywhere, so playback survives navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || BARE_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {bare ? null : <NavRail />}
      <div className={bare ? "" : "pb-16 md:pb-0 md:pl-[4.5rem]"}>{children}</div>
      <AudioDock />
      {bare ? null : <DaVinciDrawer />}
    </>
  );
}
