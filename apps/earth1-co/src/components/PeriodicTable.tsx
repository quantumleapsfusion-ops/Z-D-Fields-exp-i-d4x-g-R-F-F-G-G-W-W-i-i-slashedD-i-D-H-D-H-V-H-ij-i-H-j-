"use client";

import { useState } from "react";

interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: "nonmetal" | "metaloid" | "metal" | "transition-metal" | "lanthanide" | "actinide" | "halogen" | "noble-gas" | "alkali-metal" | "alkaline-earth";
}

const elements: Element[] = [
  { number: 1, symbol: "H", name: "Hydrogen", mass: 1.008, category: "nonmetal" },
  { number: 2, symbol: "He", name: "Helium", mass: 4.003, category: "noble-gas" },
  { number: 3, symbol: "Li", name: "Lithium", mass: 6.941, category: "alkali-metal" },
  { number: 4, symbol: "Be", name: "Beryllium", mass: 9.012, category: "alkaline-earth" },
  { number: 5, symbol: "B", name: "Boron", mass: 10.811, category: "metaloid" },
  { number: 6, symbol: "C", name: "Carbon", mass: 12.011, category: "nonmetal" },
  { number: 7, symbol: "N", name: "Nitrogen", mass: 14.007, category: "nonmetal" },
  { number: 8, symbol: "O", name: "Oxygen", mass: 15.999, category: "nonmetal" },
  { number: 9, symbol: "F", name: "Fluorine", mass: 18.998, category: "halogen" },
  { number: 10, symbol: "Ne", name: "Neon", mass: 20.180, category: "noble-gas" },
  { number: 11, symbol: "Na", name: "Sodium", mass: 22.990, category: "alkali-metal" },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, category: "alkaline-earth" },
  { number: 13, symbol: "Al", name: "Aluminum", mass: 26.982, category: "metal" },
  { number: 14, symbol: "Si", name: "Silicon", mass: 28.086, category: "metaloid" },
  { number: 15, symbol: "P", name: "Phosphorus", mass: 30.974, category: "nonmetal" },
  { number: 16, symbol: "S", name: "Sulfur", mass: 32.065, category: "nonmetal" },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: 35.453, category: "halogen" },
  { number: 18, symbol: "Ar", name: "Argon", mass: 39.948, category: "noble-gas" },
  { number: 19, symbol: "K", name: "Potassium", mass: 39.098, category: "alkali-metal" },
  { number: 20, symbol: "Ca", name: "Calcium", mass: 40.078, category: "alkaline-earth" },
  { number: 21, symbol: "Sc", name: "Scandium", mass: 44.956, category: "transition-metal" },
  { number: 22, symbol: "Ti", name: "Titanium", mass: 47.867, category: "transition-metal" },
  { number: 23, symbol: "V", name: "Vanadium", mass: 50.942, category: "transition-metal" },
  { number: 24, symbol: "Cr", name: "Chromium", mass: 51.996, category: "transition-metal" },
  { number: 25, symbol: "Mn", name: "Manganese", mass: 54.938, category: "transition-metal" },
  { number: 26, symbol: "Fe", name: "Iron", mass: 55.845, category: "transition-metal" },
  { number: 27, symbol: "Co", name: "Cobalt", mass: 58.933, category: "transition-metal" },
  { number: 28, symbol: "Ni", name: "Nickel", mass: 58.693, category: "transition-metal" },
  { number: 29, symbol: "Cu", name: "Copper", mass: 63.546, category: "transition-metal" },
  { number: 30, symbol: "Zn", name: "Zinc", mass: 65.380, category: "transition-metal" },
  { number: 31, symbol: "Ga", name: "Gallium", mass: 69.723, category: "metal" },
  { number: 32, symbol: "Ge", name: "Germanium", mass: 72.630, category: "metaloid" },
  { number: 33, symbol: "As", name: "Arsenic", mass: 74.922, category: "metaloid" },
  { number: 34, symbol: "Se", name: "Selenium", mass: 78.971, category: "nonmetal" },
  { number: 35, symbol: "Br", name: "Bromine", mass: 79.904, category: "halogen" },
  { number: 36, symbol: "Kr", name: "Krypton", mass: 83.798, category: "noble-gas" },
  { number: 47, symbol: "Ag", name: "Silver", mass: 107.868, category: "transition-metal" },
  { number: 50, symbol: "Sn", name: "Tin", mass: 118.711, category: "metal" },
  { number: 53, symbol: "I", name: "Iodine", mass: 126.904, category: "halogen" },
  { number: 54, symbol: "Xe", name: "Xenon", mass: 131.293, category: "noble-gas" },
  { number: 74, symbol: "W", name: "Tungsten", mass: 183.841, category: "transition-metal" },
  { number: 75, symbol: "Re", name: "Rhenium", mass: 186.207, category: "transition-metal" },
  { number: 78, symbol: "Pt", name: "Platinum", mass: 195.085, category: "transition-metal" },
  { number: 79, symbol: "Au", name: "Gold", mass: 196.967, category: "transition-metal" },
  { number: 80, symbol: "Hg", name: "Mercury", mass: 200.592, category: "transition-metal" },
  { number: 82, symbol: "Pb", name: "Lead", mass: 207.200, category: "metal" },
  { number: 92, symbol: "U", name: "Uranium", mass: 238.029, category: "actinide" },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  "nonmetal": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "metaloid": { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  "metal": { bg: "bg-blue-500/20", text: "text-blue-400" },
  "transition-metal": { bg: "bg-orange-500/20", text: "text-orange-400" },
  "lanthanide": { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  "actinide": { bg: "bg-purple-500/20", text: "text-purple-400" },
  "halogen": { bg: "bg-red-500/20", text: "text-red-400" },
  "noble-gas": { bg: "bg-violet-500/20", text: "text-violet-400" },
  "alkali-metal": { bg: "bg-pink-500/20", text: "text-pink-400" },
  "alkaline-earth": { bg: "bg-green-500/20", text: "text-green-400" },
};

function ElementCard({ element, selected, onSelect }: { element: Element; selected: boolean; onSelect: () => void }) {
  const colors = categoryColors[element.category];
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center rounded border p-2 text-center transition-all sm:p-3 ${
        selected ? `${colors.bg} border-white/50` : `${colors.bg} border-white/20 hover:border-white/40`
      }`}
      aria-pressed={selected}
      aria-label={`${element.name} (${element.symbol}), atomic number ${element.number}, atomic mass ${element.mass.toFixed(3)}`}
    >
      <div className="text-xs font-light text-white/60">{element.number}</div>
      <div className={`text-lg font-bold ${colors.text} sm:text-xl`}>{element.symbol}</div>
      <div className="text-xs font-light text-white/70">{element.mass.toFixed(2)}</div>
    </button>
  );
}

export function PeriodicTable() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedElement = elements.find((e) => e.number === selected);

  return (
    <div className="mt-8 w-full max-w-full space-y-6 text-left">
      <div className="overflow-x-auto">
        <div className="grid min-w-max gap-1 sm:gap-2 md:gap-3" style={{ gridTemplateColumns: "repeat(18, minmax(40px, 1fr))" }}>
          {Array.from({ length: 118 }, (_, i) => i + 1).map((num) => {
            const el = elements.find((e) => e.number === num);
            if (!el) return <div key={num} />;
            return <ElementCard key={num} element={el} selected={selected === num} onSelect={() => setSelected(num)} />;
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
        {Object.entries(categoryColors).map(([category, { bg, text }]) => (
          <div key={category} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded ${bg} border border-white/20`} />
            <span className="text-xs font-light text-white/70">{category.replace("-", " ")}</span>
          </div>
        ))}
      </div>

      {selectedElement && (
        <div className={`rounded border ${categoryColors[selectedElement.category].bg} border-white/20 p-4 sm:p-6`}>
          <h3 className="text-lg font-light tracking-[0.08em] uppercase sm:text-xl">{selectedElement.name}</h3>
          <dl className="mt-3 space-y-2 text-sm font-light text-white/80">
            <div className="flex justify-between">
              <dt>Symbol</dt>
              <dd className="font-mono">{selectedElement.symbol}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Atomic number</dt>
              <dd className="font-mono">{selectedElement.number}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Atomic mass</dt>
              <dd className="font-mono">{selectedElement.mass.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Category</dt>
              <dd className="font-mono capitalize">{selectedElement.category.replace("-", " ")}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="text-xs font-light text-white/60">
        Element data from{" "}
        <a
          href="https://www.iupac.org/what-we-do/periodic-table-of-elements/"
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-white/40 hover:border-white"
        >
          IUPAC Periodic Table
        </a>
        . Atomic masses are standard atomic weights in unified atomic mass units (u).
      </p>
    </div>
  );
}
