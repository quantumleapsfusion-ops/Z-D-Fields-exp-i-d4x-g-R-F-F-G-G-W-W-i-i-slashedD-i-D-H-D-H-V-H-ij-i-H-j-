import { CosmicMark } from "@earth-one/ui";

import { Waveform } from "@/components/Waveform";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 md:grid-cols-[auto_1fr] md:gap-16">
      <CosmicMark size={240} className="mx-auto md:mx-0" />
      <div>
        <p className="text-dust font-sans text-sm tracking-[0.14em]">
          {site.name} <span aria-hidden="true">|</span> {site.tagline}
        </p>
        <h1 className="wordmark mt-4 text-[2.1rem] leading-[1.1] sm:text-[3rem] lg:text-[3.6rem]">
          {site.hero}
        </h1>
        <div className="rainbow-rule mt-6 max-w-md" />
        <p className="font-display silver-text mt-6 text-5xl sm:text-6xl">{site.motto}</p>
        <p className="text-dust mt-8 font-sans text-xl sm:text-2xl">{site.subhead}</p>
        <p className="text-dust/80 mt-3 max-w-2xl font-sans text-base sm:text-lg">
          {site.pitch}
        </p>
        <Waveform className="animate-drift mt-10" />
      </div>
    </section>
  );
}
