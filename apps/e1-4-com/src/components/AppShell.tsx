"use client";

import { usePathname } from "next/navigation";

import { AudioDock } from "@/components/AudioDock";
import { DaVinciDrawer } from "@/components/DaVinciDrawer";
import { NavRail } from "@/components/NavRail";
import { VoiceNav } from "@/components/VoiceNav";

/** Routes that render as full pages (marketing, auth, public shares) rather than app surfaces. */
const BARE_PREFIXES = ["/login", "/auth", "/s/", "/privacy"];

/**
 * Client shell around every page: the persistent nav rail on app routes, the voice navigator
 * and the global audio dock everywhere, so playback survives navigation. The voice gate
 * (/login) owns the microphone itself, so the navigator stays out of its way there.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || BARE_PREFIXES.some((p) => pathname.startsWith(p));
  const gate = pathname.startsWith("/login");

  return (
    <>
      {bare ? null : <NavRail />}
      <div className={bare ? "" : "pb-16 md:pb-0 md:pl-[4.5rem]"}>{children}</div>
      {gate ? null : <VoiceNav bare={bare} />}
      <AudioDock />
      {bare ? null : <DaVinciDrawer />}
    </>
  );
}
