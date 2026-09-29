import Link from "next/link";

import { VoiceStreamDemo } from "@/components/VoiceStreamDemo";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="page grid items-center gap-14 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20 lg:py-32">
      <div>
        <p className="label text-accent">{site.tagline}</p>
        <h1 className="font-display mt-6 text-[5rem] leading-[0.9] font-bold tracking-tight sm:text-[6.5rem] lg:text-[8.25rem]">
          {site.hero}
        </h1>
        <p className="text-text-2 mt-8 max-w-md font-sans text-lg leading-relaxed sm:text-xl">
          {site.pitch}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/stream" className="pill bg-accent text-bg hover:bg-text">
            <MicIcon />
            {site.cta}
          </Link>
          <Link
            href="/login"
            className="pill border-border-strong text-text hover:border-text border"
          >
            {site.earlyAccess}
          </Link>
        </div>
      </div>
      <VoiceStreamDemo />
    </section>
  );
}

function MicIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
