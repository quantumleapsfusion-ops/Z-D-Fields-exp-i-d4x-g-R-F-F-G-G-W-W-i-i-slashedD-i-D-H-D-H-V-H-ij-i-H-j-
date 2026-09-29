import { site } from "@/lib/site";

export function Philosophy() {
  return (
    <section
      aria-labelledby="philosophy-heading"
      className="mx-auto max-w-5xl px-5 pb-28 sm:px-8 sm:pb-40"
    >
      <div className="chalk-rule mb-20" />
      <h2
        id="philosophy-heading"
        className="font-display text-[2.75rem] leading-[0.95] tracking-tight sm:text-[5rem] lg:text-[6.5rem]"
      >
        {site.motto}
      </h2>
      <p className="text-dust mt-8 max-w-2xl font-sans text-lg leading-relaxed sm:text-2xl">
        earth1.co argues why; {site.flagship.domain} builds how — a voice-only, borderless
        way to speak, one voice at a time.
      </p>
    </section>
  );
}
