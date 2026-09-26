import { Waveform } from "@/components/Waveform";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-20 pb-20 sm:px-8 sm:pt-32 sm:pb-28">
      <h1 className="font-display text-[3rem] leading-[0.95] tracking-tight sm:text-[5.5rem] lg:text-[7rem]">
        {site.hero}
      </h1>
      <p className="font-display text-dust mt-5 text-2xl sm:text-3xl">{site.motto}</p>
      <p className="text-dust mt-6 font-sans text-xl sm:mt-8 sm:text-2xl">
        {site.tagline}
      </p>
      <Waveform className="animate-drift mt-10" />
    </section>
  );
}
