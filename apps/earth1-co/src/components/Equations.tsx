import { equations, tokenizeEquation, type Equation } from "@/lib/equations";

function Formula({ tex }: { tex: Equation["tex"] }) {
  return (
    <span className="font-mono text-[1.375rem] leading-tight sm:text-[1.75rem]">
      {tokenizeEquation(tex).map((token, i) => {
        if (token.kind === "sub") return <sub key={i}>{token.value}</sub>;
        if (token.kind === "sup") return <sup key={i}>{token.value}</sup>;
        return <span key={i}>{token.value}</span>;
      })}
    </span>
  );
}

export function Equations() {
  return (
    <section className="page py-8 sm:py-12">
      <h2 className="label">Equations</h2>
      <ul className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
        {equations.map((eq) => (
          <li key={eq.id} className="card p-7 sm:p-10">
            <p className="label text-accent">{eq.name}</p>
            <p className="mt-6" aria-label={eq.tex.replace(/[_^]\{([^}]*)\}/g, "$1")}>
              <Formula tex={eq.tex} />
            </p>
            <p className="text-text-2 mt-6 font-sans text-base leading-relaxed sm:text-lg">
              {eq.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
