"use client";

import { CalculusIllustration } from "@/components/CalculusIllustration";
import { DifferentialEquationsIllustration } from "@/components/DifferentialEquationsIllustration";
import { DivisionIllustration } from "@/components/DivisionIllustration";
import { EuclidElementsIllustration } from "@/components/EuclidElementsIllustration";
import { FunctionsIllustration } from "@/components/FunctionsIllustration";
import { IntegersIllustration } from "@/components/IntegersIllustration";
import { ParametricCurvesIllustration } from "@/components/ParametricCurvesIllustration";
import { VectorIllustration } from "@/components/VectorIllustration";
import { research } from "@/lib/research";
import { site } from "@/lib/site";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function PillarPage() {
  const params = useParams();
  const pillar = params.pillar as string;

  const page = useMemo(
    () => site.pillars.find((p) => p.slug === pillar),
    [pillar]
  );

  if (!page) return null;

  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        {page.line}
      </p>

      {page.slug === "mathematics" && (
        <div className="mt-16 w-full max-w-4xl space-y-16">
          {/* Calculus */}
          <section id="calculus" aria-labelledby="calculus-title">
            <h2
              id="calculus-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Calculus
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              The mathematics of change. Here we see a parabola f(x) = x² with
              its tangent line showing the derivative (instantaneous rate of
              change) and the shaded area beneath showing the integral (the
              accumulation of change). The fundamental theorem of calculus
              connects these two seemingly different ideas.
            </p>
            <div className="mt-8">
              <CalculusIllustration />
            </div>
          </section>

          {/* Vectors */}
          <section id="vectors" aria-labelledby="vectors-title">
            <h2
              id="vectors-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Vectors
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              Quantities with both magnitude and direction. Here two vectors A
              and B rotate together. Their dot product (A · B) measures how
              aligned they are. When perpendicular, the dot product is zero.
              The angle θ between them is shown at the bottom.
            </p>
            <div className="mt-8">
              <VectorIllustration />
            </div>
          </section>

          {/* Differential Equations */}
          <section id="differential-equations" aria-labelledby="diff-eq-title">
            <h2
              id="diff-eq-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Differential Equations
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              Equations describing rates of change. The slope field shows, at
              every point, what direction the solution must go. The orange
              curve is a particular solution to dy/dx = y, which is the
              exponential function e^x. This describes exponential growth,
              seen in populations, radioactive decay, and compound interest.
            </p>
            <div className="mt-8">
              <DifferentialEquationsIllustration />
            </div>
          </section>

          {/* Parametric Curves */}
          <section id="parametric-curves" aria-labelledby="parametric-title">
            <h2
              id="parametric-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Parametric Curves
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              Curves traced by a moving point. Instead of y = f(x), we describe
              both x and y as functions of a parameter t. The circle uses
              x = cos(t), y = sin(t). A Lissajous figure, created when x = sin(3t)
              and y = sin(2t), arises in wave interference. The cycloid is
              traced by a point on a rolling wheel, and appears in physics
              and engineering.
            </p>
            <div className="mt-8">
              <ParametricCurvesIllustration />
            </div>
          </section>

          {/* Euclid's Elements */}
          <section id="euclid-elements" aria-labelledby="euclid-title">
            <h2
              id="euclid-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Euclid's Elements
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              The most influential mathematics text ever written, containing
              logical proofs that hold across all times and places. Proposition
              I.1 shows how to construct an equilateral triangle with compass
              and straightedge alone. From just this and a few other axioms,
              Euclid built the entire geometry of the plane.
            </p>
            <div className="mt-8">
              <EuclidElementsIllustration />
            </div>
          </section>

          {/* Functions */}
          <section id="functions" aria-labelledby="functions-title">
            <h2
              id="functions-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Functions
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              The fundamental building block of mathematics. A function maps
              elements from one set (the domain) to elements in another set
              (the codomain). Here, the function f(x) = x² takes inputs like
              −2, −1, 0, 1, 2 and produces outputs 4, 1, 0, 1, 4. Functions
              describe relationships between quantities and are essential to
              modeling everything from physics to economics.
            </p>
            <div className="mt-8">
              <FunctionsIllustration />
            </div>
          </section>

          {/* Integers */}
          <section id="integers" aria-labelledby="integers-title">
            <h2
              id="integers-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Integers
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              The whole numbers—positive, negative, and zero. On the number
              line, each integer occupies a precise position. We can add,
              subtract, multiply, and divide integers, performing the
              fundamental operations that govern arithmetic. These operations
              extend to more complex number systems and are the foundation of
              all numerical reasoning.
            </p>
            <div className="mt-8">
              <IntegersIllustration />
            </div>
          </section>

          {/* Division */}
          <section id="division" aria-labelledby="division-title">
            <h2
              id="division-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Division & Modular Arithmetic
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              When we divide integers, we get a quotient and a remainder. The
              division algorithm states: a = qb + r, where a is the dividend,
              b is the divisor, q is the quotient, and r is the remainder.
              This simple formula unlocks modular arithmetic, where we care
              only about the remainder. Modular arithmetic appears in
              cryptography, computer science, and the study of periodic
              phenomena throughout nature.
            </p>
            <div className="mt-8">
              <DivisionIllustration />
            </div>
          </section>
        </div>
      )}

      {page.slug === "research" && (
        <div className="mt-16 grid w-full max-w-4xl gap-12 text-left sm:grid-cols-2">
          {research.map((area) => (
            <section key={area.id} id={area.id} aria-labelledby={`${area.id}-title`}>
              <h2
                id={`${area.id}-title`}
                className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
              >
                {area.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
                {area.question}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {area.focus.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full border border-white/25 px-3 py-1 text-xs tracking-[0.08em]"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
              <a
                href={area.reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block border-b border-white/40 pb-0.5 text-xs tracking-[0.08em] text-white/70 hover:text-white"
              >
                {area.reference.title} ↗
              </a>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
