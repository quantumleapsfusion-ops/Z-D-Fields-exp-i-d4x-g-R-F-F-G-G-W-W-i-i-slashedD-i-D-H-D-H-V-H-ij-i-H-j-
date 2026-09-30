"use client";

import { usePathname } from "next/navigation";

import { VoiceCommandOrb } from "@/components/VoiceCommandOrb";

/** Routes whose own full-screen mic already handles voice. */
const OWN_MIC = ["/", "/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const orb = !OWN_MIC.includes(pathname) && !pathname.startsWith("/s/");
  return (
    <>
      {children}
      {orb ? <VoiceCommandOrb /> : null}
    </>
  );
}
