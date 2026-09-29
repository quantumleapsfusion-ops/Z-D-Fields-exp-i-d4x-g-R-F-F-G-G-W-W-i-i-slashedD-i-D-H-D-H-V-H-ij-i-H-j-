import { site } from "@/lib/site";

function Schrodinger() {
  return (
    <>
      iħ <span className="whitespace-nowrap">∂Ψ/∂t</span> = ĤΨ
    </>
  );
}

function Einstein() {
  return (
    <>
      G<sub>μν</sub> + Λg<sub>μν</sub> ={" "}
      <span className="whitespace-nowrap">
        8πG/c<sup>4</sup>
      </span>{" "}
      · T<sub>μν</sub>
    </>
  );
}

const cards = [
  {
    name: "Schrödinger equation",
    caption: "A wavefunction doesn't carry a passport.",
    Formula: Schrodinger,
  },
  {
    name: "Einstein field equations",
    caption: "Spacetime curves the same way on every side of every border.",
    Formula: Einstein,
  },
];

export function Equations() {
  return (
    <section
      aria-labelledby="equations-heading"
      className="mx-auto max-w-5xl px-5 pb-24 sm:px-8 sm:pb-32"
    >
      <p className="label">Physical law</p>
      <h2
        id="equations-heading"
        className="font-display mt-3 max-w-3xl text-3xl tracking-tight sm:text-5xl"
      >
        The universe doesn&rsquo;t recognise borders. Neither should a conversation.
      </h2>
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {cards.map(({ name, caption, Formula }) => (
          <figure
            key={name}
            className="border-line bg-board-2 flex flex-col justify-between rounded-[var(--radius-board)] border p-8 sm:p-10"
          >
            <p className="label">{name}</p>
            <p className="font-display text-chalk my-10 text-3xl tracking-tight sm:text-4xl">
              <Formula />
            </p>
            <figcaption className="text-dust font-sans text-lg leading-snug">
              {caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <a
        href={site.flagship.url}
        rel="noreferrer"
        className="border-ochre/60 text-ochre hover:border-ochre hover:text-chalk mt-10 inline-flex items-center gap-2 border-b pb-1 font-sans text-base transition-colors sm:text-lg"
      >
        Fuller write-ups on {site.flagship.domain}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
