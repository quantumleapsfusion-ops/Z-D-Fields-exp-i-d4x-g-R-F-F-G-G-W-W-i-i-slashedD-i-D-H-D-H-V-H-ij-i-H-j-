import { mission } from "@/lib/site";

export function Mission() {
  return (
    <section id="mission" className="page scroll-mt-24 py-24 sm:py-32">
      <h2 className="label">Mission</h2>
      <div className="font-display mt-8 max-w-3xl text-[1.5rem] leading-[1.25] font-light tracking-tight sm:text-[2.25rem]">
        {mission.lines.map((line, i) => (
          <p key={line} className={i === 0 ? "text-text-2" : "text-text"}>
            {line}
          </p>
        ))}
      </div>

      <ul className="mt-16 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {mission.pillars.map((pillar) => (
          <li key={pillar.title} className="card flex flex-col p-7 sm:p-8">
            <span
              aria-hidden
              className="text-accent font-display text-3xl leading-none font-light"
            >
              {pillar.glyph}
            </span>
            <h3 className="font-display mt-8 text-lg font-medium tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-text-2 mt-3 font-sans text-[15px] leading-relaxed">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
