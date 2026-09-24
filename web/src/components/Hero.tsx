export default function Hero() {
  return (
    <section
      id="top"
      className="border-b border-black/5 bg-gradient-to-b from-sky-50 to-white px-6 py-24 sm:py-32 dark:border-white/10 dark:from-zinc-900 dark:to-black"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-600 dark:text-sky-400">
          e1-4.com
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl dark:text-zinc-50">
          Engineering for what comes next.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          We design, build and operate software, data and automation systems —
          from first prototype to production scale.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Start a project
          </a>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-8 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            What we do
          </a>
        </div>
      </div>
    </section>
  );
}
