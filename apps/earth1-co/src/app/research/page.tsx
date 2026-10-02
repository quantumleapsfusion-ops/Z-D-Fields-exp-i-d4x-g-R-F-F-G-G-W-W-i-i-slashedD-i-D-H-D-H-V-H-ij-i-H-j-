import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research",
  description: "Open research projects at Earth 1 Lab",
  alternates: { canonical: "/research" },
};

const projects = [
  {
    id: "psigda-burgers",
    title: "Physics-Informed Neural Networks for Burgers' Equation",
    question:
      "Can a physics-informed neural network solve Burgers' equation more cheaply than the published baseline?",
    status: "Planned" as const,
    lastUpdated: null as string | null,
  },
];

export default function ResearchPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Research
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        Open questions, answered in the open, for everyone.
      </p>

      <div className="mt-16 grid w-full max-w-4xl gap-12 text-left sm:grid-cols-2">
        {projects.map((project) => (
          <section
            key={project.id}
            id={project.id}
            aria-labelledby={`${project.id}-title`}
          >
            <h2
              id={`${project.id}-title`}
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              <Link
                href={`/research/${project.id}`}
                className="hover:text-white/70 transition-colors"
              >
                {project.title}
              </Link>
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              {project.question}
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-light tracking-[0.08em] text-white/50">
              <span>{project.status}</span>
              {project.lastUpdated && <span>Updated {project.lastUpdated}</span>}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
