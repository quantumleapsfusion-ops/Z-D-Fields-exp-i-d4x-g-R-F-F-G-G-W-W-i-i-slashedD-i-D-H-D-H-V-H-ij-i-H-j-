import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Papers",
  description: "Research papers we are studying and reproducing",
  alternates: { canonical: "/papers" },
};

const papers = [
  {
    title: "Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations",
    authors: "Raissi, M., Perdikaris, P., & Karniadakis, G. E.",
    year: 2019,
    url: "https://www.sciencedirect.com/science/article/pii/S0021999118307125",
    note: "Foundational work on PINNs for PDEs",
  },
  {
    title: "DeepXDE: A deep learning library for solving differential equations",
    authors: "Lu, L., Meng, X., Cai, S., Mao, Z., Goswami, S., & Karniadakis, G. E.",
    year: 2019,
    url: "https://arxiv.org/abs/1907.04502",
    note: "Deep learning framework for differential equations",
  },
  {
    title: "Fourier Neural Operator for Parametric Partial Differential Equations",
    authors: "Li, Z., Kovachki, N., Azizzadenesheli, K., Liu, B., Bhattacharya, K., Stuart, A., & Anandkumar, A.",
    year: 2020,
    url: "https://arxiv.org/abs/2010.08895",
    note: "Fourier-based neural operators for PDEs",
  },
  {
    title: "Variational quantum algorithms for nonlinear problems",
    authors: "Lubasch, M., Joo, J., Moinier, P., Kiffner, M., & Jaksch, D.",
    year: 2020,
    url: "https://arxiv.org/abs/2012.09265",
    note: "Quantum algorithms for solving nonlinear PDEs",
  },
];

export default function PapersPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Papers
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        Research papers we are studying and reproducing.
      </p>

      <div className="mt-12 max-w-4xl space-y-8 text-left">
        {papers.map((paper, idx) => (
          <article
            key={idx}
            className="border-b border-white/10 pb-8 last:border-b-0"
          >
            <h2 className="text-base leading-relaxed font-light hover:text-white/70 transition-colors">
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                {paper.title}
              </a>
            </h2>
            <p className="mt-3 text-sm text-white/70">
              {paper.authors} ({paper.year})
            </p>
            {paper.note && (
              <p className="mt-2 text-xs font-light text-white/50 italic">
                {paper.note}
              </p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
