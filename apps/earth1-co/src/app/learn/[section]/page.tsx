import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { learn, type LearnSlug } from "@/lib/learn";

type Props = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return learn.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const page = learn.find((s) => s.slug === section);
  if (!page) return {};
  return {
    title: `${page.title} | Learn`,
    description: page.line,
    alternates: { canonical: `/learn/${page.slug}` },
  };
}

const content: Record<string, React.ReactNode> = {
  physics: (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">The Laws of Motion and Energy</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Physics describes how the universe works through mathematical laws. From the motion of planets to the behavior of light, these equations reveal the deep structure of reality.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        At Earth 1 Lab, we use physics-informed neural networks to solve the differential equations that govern fluid dynamics, quantum systems, and other complex phenomena. These methods combine the power of machine learning with the fundamental laws of physics.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Classical mechanics and relativity</li>
        <li>• Differential equations and conservation laws</li>
        <li>• Quantum mechanics and the wave function</li>
        <li>• Physics-informed neural networks (PINNs)</li>
      </ul>
    </>
  ),
  mathematics: (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">The Universal Language</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Mathematics is the language in which the laws of nature are written. It provides the tools to model systems, solve equations, and discover patterns across all domains.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        Differential equations, linear algebra, and optimization form the foundation of modern scientific computing. Machine learning itself is built on mathematical principles of optimization and probability.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Calculus and differential equations</li>
        <li>• Linear algebra and matrix computation</li>
        <li>• Optimization and gradient descent</li>
        <li>• Probability and statistics</li>
      </ul>
    </>
  ),
  chemistry: (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">Atoms and Bonds</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Chemistry explains how atoms combine to form molecules and materials. From the smallest quantum interactions to the largest chemical reactions, this science bridges atoms and life.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Atomic structure and electron configuration</li>
        <li>• Chemical bonds and reactions</li>
        <li>• Thermodynamics and kinetics</li>
        <li>• Quantum chemistry</li>
      </ul>
    </>
  ),
  biology: (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">Life and Systems</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Biology studies life at every scale, from molecular mechanisms to ecosystems. It reveals how organization, evolution, and adaptation shape the living world.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Molecular and cellular biology</li>
        <li>• Genetics and evolution</li>
        <li>• Physiology and systems biology</li>
        <li>• Ecology and biodiversity</li>
      </ul>
    </>
  ),
  "quantum-mechanics": (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">The Rules of the Very Small</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Quantum mechanics describes the behavior of atoms, electrons, and photons. At this scale, reality follows rules that often defy classical intuition yet reveal profound truths about existence.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        Superposition, entanglement, and quantum tunneling are not merely abstract concepts—they power the technologies of tomorrow, from semiconductors to quantum computers.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Wave-particle duality and the Schrödinger equation</li>
        <li>• Quantum superposition and entanglement</li>
        <li>• Spin and angular momentum</li>
        <li>• Quantum algorithms</li>
      </ul>
    </>
  ),
  "quantum-computing": (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">Computing with Quantum Bits</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Quantum computers harness quantum phenomena to solve problems beyond the reach of classical computers. By exploiting superposition and entanglement, they can explore vast solution spaces simultaneously.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        Applications in physics simulation, optimization, and cryptography promise to revolutionize how we solve humanity's greatest challenges.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Qubits and quantum gates</li>
        <li>• Quantum circuits and algorithms</li>
        <li>• Error correction and decoherence</li>
        <li>• Variational quantum algorithms</li>
      </ul>
    </>
  ),
  "global-citizenship": (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">Every Person on Earth is a Citizen of It</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Global citizenship recognizes that we share one planet and one future. As scientific knowledge advances, so grows our responsibility to ensure that breakthroughs benefit all of humanity.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        Science transcends borders. The laws of physics hold on every shore. Mathematics is the one language every nation already shares. At Earth 1 Lab, we believe in open, collaborative research that serves humanity as a whole.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Key Topics</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Interconnectedness of global systems</li>
        <li>• Science for sustainable development</li>
        <li>• International collaboration and open science</li>
        <li>• Ethical implications of technology</li>
      </ul>
    </>
  ),
  philanthropy: (
    <>
      <h2 className="text-lg sm:text-2xl font-light tracking-[0.1em] mt-12 mb-6">What We Build, We Give to the World</h2>
      <p className="text-white/70 mb-4 leading-relaxed">
        Philanthropy means directing resources toward the good of humanity. At Earth 1 Lab, this principle is embedded in everything we do. Our research, our tools, and our discoveries are open to all.
      </p>
      <p className="text-white/70 mb-4 leading-relaxed">
        We publish our methods. We share our code. We teach what we learn. No breakthroughs in physics or artificial intelligence should be locked behind paywalls when they could accelerate progress for all nations and all people.
      </p>
      <h3 className="text-base sm:text-lg font-light tracking-[0.08em] mt-8 mb-4">Our Commitment</h3>
      <ul className="text-white/70 space-y-2 ml-4">
        <li>• Open-source research and code</li>
        <li>• Free educational resources and tools</li>
        <li>• Public APIs and shared infrastructure</li>
        <li>• Collaboration with researchers worldwide</li>
      </ul>
    </>
  ),
};

export default async function LearnPage({ params }: Props) {
  const { section } = await params;
  const page = learn.find((s) => s.slug === section);
  if (!page) notFound();

  return (
    <>
      <div className="mb-12">
        <Link
          href="/learn"
          className="text-sm font-light tracking-[0.08em] text-white/50 hover:text-white/70 transition-colors"
        >
          ← Back to Learn
        </Link>
      </div>

      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        {page.line}
      </p>

      <div className="mt-12 max-w-3xl text-left">
        {content[section] || (
          <p className="text-white/50 text-sm font-light">
            Content for {page.title} coming soon.
          </p>
        )}
      </div>
    </>
  );
}
