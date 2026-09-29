import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-20 pb-12 sm:px-8 sm:pt-32">
      <p className="label mb-6">{site.name}</p>
      <h1 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
        {site.hero}
      </h1>
      <p className="text-dust mt-3 font-sans text-base">{site.motto}</p>
      <p className="text-dust mt-5 font-sans text-lg">{site.subhead}</p>
      <p className="text-dust mt-3 max-w-2xl font-sans text-base">{site.pitch}</p>
    </section>
  );
}
