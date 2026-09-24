const features = [
  {
    title: "Product engineering",
    description:
      "Full-stack web and mobile products built with TypeScript, React and modern cloud infrastructure.",
  },
  {
    title: "Data platforms",
    description:
      "Pipelines, warehouses and reporting layers that make operational data usable and trustworthy.",
  },
  {
    title: "Automation",
    description:
      "Workflow automation and integrations that remove manual steps from day-to-day operations.",
  },
  {
    title: "Platform & reliability",
    description:
      "CI/CD, observability and infrastructure-as-code so releases stay fast and predictable.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-y border-black/5 bg-zinc-50 px-6 py-20 sm:py-28 dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Services
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Four practices that cover the lifecycle of a system, from idea to
          steady-state operation.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-black"
            >
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
