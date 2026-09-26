import { principles } from "@/lib/site";

export function GovernanceManifesto() {
  return (
    <section
      id="governance"
      aria-labelledby="governance-heading"
      className="mx-auto max-w-5xl px-5 pb-24 sm:px-8"
    >
      <p className="label">Governance</p>
      <h2
        id="governance-heading"
        className="font-display mt-3 text-3xl tracking-tight sm:text-5xl"
      >
        Four principles, in the order we would break them last.
      </h2>
      <ol className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-x-14">
        {principles.map((p) => (
          <li key={p.index} className="flex gap-5">
            <span className="font-display text-ochre w-8 shrink-0 text-2xl leading-none">
              {p.index}
            </span>
            <div>
              <h3 className="font-display text-xl tracking-tight sm:text-2xl">
                {p.title}
              </h3>
              <p className="text-chalk/75 mt-3 font-sans text-base leading-relaxed">
                {p.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
