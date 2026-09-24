const stats = [
  { value: "2024", label: "Founded" },
  { value: "12+", label: "Projects delivered" },
  { value: "4", label: "Core practices" },
];

export default function About() {
  return (
    <section id="about" className="px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            About e1-4
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            e1-4 is a small, senior engineering team. We work directly with
            founders and technical leaders to turn ambiguous problems into
            systems that ship, scale and stay maintainable.
          </p>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Placeholder copy — replace with the final company story, mission and
            team bios.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:self-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-black/5 bg-zinc-50 p-6 dark:border-white/10 dark:bg-zinc-900"
            >
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
