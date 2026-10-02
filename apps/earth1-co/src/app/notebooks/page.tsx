import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notebooks",
  description: "Google Colab notebooks and code for Earth 1 Lab research",
  alternates: { canonical: "/notebooks" },
};

export default function NotebooksPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Notebooks
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        Public research notebooks and code.
      </p>

      <div className="mt-12 max-w-4xl space-y-12 text-left">
        {/* Colab Section */}
        <section>
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            Google Colab
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Interactive notebooks for exploring our research.
          </p>
          <ul className="mt-6 space-y-3">
            <li>
              <p className="text-white/50 text-xs font-light tracking-[0.08em] uppercase">
                Coming soon
              </p>
            </li>
          </ul>
        </section>

        {/* GitHub Section */}
        <section>
          <h2 className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl">
            GitHub Repository
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Source code and implementation details.
          </p>
          <a
            href="https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-[0.08em] uppercase hover:bg-white/10 transition-colors"
          >
            View on GitHub
          </a>
        </section>
      </div>
    </>
  );
}
