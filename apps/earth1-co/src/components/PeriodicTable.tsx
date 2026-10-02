"use client";

import { useState } from "react";

interface Element {
  number: number;
  symbol: string;
  name: string;
  category: "nonmetal" | "metal" | "noble-gas" | "metalloid" | "halogen" | "alkali";
  atomicMass: number;
}

const ELEMENTS: Element[] = [
  { number: 1, symbol: "H", name: "Hydrogen", category: "nonmetal", atomicMass: 1.008 },
  { number: 2, symbol: "He", name: "Helium", category: "noble-gas", atomicMass: 4.003 },
  { number: 3, symbol: "Li", name: "Lithium", category: "alkali", atomicMass: 6.941 },
  { number: 4, symbol: "Be", name: "Beryllium", category: "metal", atomicMass: 9.012 },
  { number: 5, symbol: "B", name: "Boron", category: "metalloid", atomicMass: 10.81 },
  { number: 6, symbol: "C", name: "Carbon", category: "nonmetal", atomicMass: 12.01 },
  { number: 7, symbol: "N", name: "Nitrogen", category: "nonmetal", atomicMass: 14.01 },
  { number: 8, symbol: "O", name: "Oxygen", category: "nonmetal", atomicMass: 16.0 },
  { number: 9, symbol: "F", name: "Fluorine", category: "halogen", atomicMass: 19.0 },
  { number: 10, symbol: "Ne", name: "Neon", category: "noble-gas", atomicMass: 20.18 },
  { number: 11, symbol: "Na", name: "Sodium", category: "alkali", atomicMass: 22.99 },
  { number: 12, symbol: "Mg", name: "Magnesium", category: "metal", atomicMass: 24.31 },
  { number: 17, symbol: "Cl", name: "Chlorine", category: "halogen", atomicMass: 35.45 },
  { number: 18, symbol: "Ar", name: "Argon", category: "noble-gas", atomicMass: 39.95 },
];

const categoryColors: Record<Element["category"], string> = {
  "nonmetal": "bg-blue-900/40 border-blue-400/60",
  "metal": "bg-amber-900/40 border-amber-400/60",
  "noble-gas": "bg-purple-900/40 border-purple-400/60",
  "metalloid": "bg-green-900/40 border-green-400/60",
  "halogen": "bg-red-900/40 border-red-400/60",
  "alkali": "bg-orange-900/40 border-orange-400/60",
};

const categoryLabels: Record<Element["category"], string> = {
  "nonmetal": "Nonmetal",
  "metal": "Metal",
  "noble-gas": "Noble gas",
  "metalloid": "Metalloid",
  "halogen": "Halogen",
  "alkali": "Alkali metal",
};

export function PeriodicTable() {
  const [selected, setSelected] = useState<Element | null>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-light tracking-[0.08em] uppercase text-white/70 mb-4">
          Periodic table of elements
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {ELEMENTS.map((el) => (
            <button
              key={el.number}
              onClick={() => setSelected(el)}
              className={`aspect-square flex items-center justify-center rounded border transition-all ${
                selected?.number === el.number
                  ? "ring-2 ring-white"
                  : "hover:ring-1 hover:ring-white/50"
              } ${categoryColors[el.category]} text-xs sm:text-sm font-mono`}
            >
              <div className="text-center">
                <div className="text-xs text-white/60">{el.number}</div>
                <div className="font-semibold">{el.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${categoryColors[key as Element["category"]]}`} />
            <span className="text-white/70">{label}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div className={`rounded border border-white/20 bg-white/5 p-6 space-y-3 transition-all ${
          !reduce ? "animate-in" : ""
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xl font-display tracking-[0.1em]">{selected.name}</h4>
              <p className="text-sm text-white/60 mt-1">Atomic number: {selected.number}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-semibold">{selected.symbol}</div>
              <div className="text-xs text-white/60 mt-1">Mass: {selected.atomicMass.toFixed(3)}</div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/70">
              Category: <span className="text-white">{categoryLabels[selected.category]}</span>
            </p>
          </div>
        </div>
      )}

      <div className="text-xs leading-relaxed text-white/60 space-y-2">
        <p>
          The periodic table organizes elements by atomic number and chemical properties. Elements in the same column share similar valence electrons and bonding behavior.
        </p>
        <p>
          Atoms bond when they share or transfer electrons to achieve stable electron configurations. Chemical reactions rearrange atomic bonds, releasing or absorbing energy.
        </p>
      </div>
    </div>
  );
}
