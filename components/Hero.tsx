import { Waveform } from '@/components/Waveform';
import { site } from '@/lib/site';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-32">
      <h1 className="font-display text-[3rem] leading-[0.95] tracking-tight sm:text-[5.5rem] lg:text-[7rem]">
        {site.hero}
      </h1>
      <p className="mt-5 font-display text-2xl text-dust sm:text-3xl">{site.motto}</p>
      <p className="mt-6 font-sans text-xl text-dust sm:mt-8 sm:text-2xl">{site.tagline}</p>
      <Waveform className="mt-10 animate-drift" />
    </section>
  );
}
