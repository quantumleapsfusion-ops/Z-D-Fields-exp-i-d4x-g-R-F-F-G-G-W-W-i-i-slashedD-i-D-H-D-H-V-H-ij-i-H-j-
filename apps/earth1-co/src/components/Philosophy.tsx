import { philosophy } from "@/lib/site";

export function Philosophy() {
  return (
    <section id="philosophy" className="page scroll-mt-24 py-32 sm:py-44">
      <h2 className="label">Philosophy</h2>
      <p className="font-display mt-8 max-w-5xl text-[2.5rem] leading-[1.02] font-light tracking-[-0.02em] sm:text-[4.5rem] lg:text-[6rem]">
        {philosophy.statement}
      </p>
      <p className="text-text-2 mt-10 max-w-xl font-sans text-lg leading-relaxed">
        {philosophy.support}
      </p>
    </section>
  );
}
