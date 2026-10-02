import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Burgers&apos; Equation | Research",
  description:
    "Physics-informed neural networks for Burgers&apos; equation. Can we solve it more cheaply than the baseline?",
  alternates: { canonical: "/research/psigda-burgers" },
};

export default function BurgersPage() {
  return (
    <>
      <div className="mb-12">
        <Link
          href="/research"
          className="text-sm font-light tracking-[0.08em] text-white/50 hover:text-white/70 transition-colors"
        >
          ← Back to Research
        </Link>
      </div>

      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Physics-Informed Neural Networks
      </h1>
      <h2 className="mt-4 text-lg sm:text-xl font-light text-white/70">
        Burgers&apos; Equation
      </h2>

      <div className="mt-12 max-w-3xl space-y-12 text-left">
        {/* Question */}
        <section>
          <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/50">
            Question
          </h3>
          <p className="mt-4 text-base leading-relaxed">
            Can a physics-informed neural network solve Burgers&apos; equation more
            cheaply than the published baseline?
          </p>
        </section>

        {/* Equation */}
        <section>
          <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/50">
            Equation
          </h3>
          <div className="mt-4 rounded-sm border border-white/10 bg-white/5 p-6">
            <code className="text-sm font-mono">
              ∂u/∂t + u ∂u/∂x = ν ∂²u/∂x²
            </code>
            <div className="mt-4 text-sm text-white/70">
              ν = 0.01/π, x ∈ [−1, 1], t ∈ [0, 1]
            </div>
          </div>
        </section>

        {/* Method */}
        <section>
          <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/50">
            Method
          </h3>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            We reproduce the DeepXDE Burgers&apos; equation example using
            physics-informed neural networks, measuring L2 relative error
            against the reference solution.
          </p>
        </section>

        {/* Baseline */}
        <section>
          <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/50">
            Baseline
          </h3>
          <p className="mt-4 text-base leading-relaxed">
            <a
              href="https://github.com/lululxvi/deepxde"
              className="text-white hover:text-white/70 transition-colors underline"
            >
              DeepXDE Burgers&apos; Equation Example
            </a>
            <span className="ml-2 text-white/50">(L2 relative error)</span>
          </p>
        </section>

        {/* Status */}
        <section>
          <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/50">
            Status
          </h3>
          <p className="mt-4 text-base">
            <span className="inline-block rounded-sm border border-white/10 bg-white/5 px-3 py-1 text-xs font-light tracking-[0.08em] uppercase">
              Planned
            </span>
          </p>
        </section>

        {/* Links */}
        <section className="flex gap-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
              Notebook
            </p>
            <p className="mt-2 text-sm text-white/70">Colab (coming soon)</p>
          </div>
          <div>
            <p className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
              Code
            </p>
            <p className="mt-2 text-sm text-white/70">GitHub (coming soon)</p>
          </div>
        </section>
      </div>
    </>
  );
}
