"use client";

import { useMemo, useState } from "react";

import { symbols, type MathSymbol } from "@/lib/explore/symbols";

const groups: MathSymbol["group"][] = [
  "greek-lower",
  "greek-upper",
  "operator",
  "relation",
  "set-logic",
  "calculus",
  "quantum-notation",
  "constant",
  "other",
];

const groupNames: Record<MathSymbol["group"], string> = {
  "greek-lower": "Greek lowercase",
  "greek-upper": "Greek uppercase",
  operator: "Operators",
  relation: "Relations",
  "set-logic": "Sets & logic",
  calculus: "Calculus",
  "quantum-notation": "Quantum notation",
  constant: "Constants",
  other: "Other",
};

export function SymbolGlossary() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<MathSymbol["group"]>>(
    () => new Set(groups),
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return symbols.filter((symbol) => {
      const matchesGroup = selected.has(symbol.group);
      const searchable = [
        symbol.glyph,
        symbol.name,
        ...(symbol.tex ?? []),
        ...symbol.meanings,
        symbol.example ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase();
      return matchesGroup && (!needle || searchable.includes(needle));
    });
  }, [query, selected]);

  function toggleGroup(group: MathSymbol["group"]) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  return (
    <div className="mt-8">
      <label className="label block" htmlFor="symbol-search">
        Search symbols
      </label>
      <input
        id="symbol-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try “frequency”, “\\hbar”, or ν"
        className="mt-2 w-full border border-white/30 bg-black/50 px-4 py-3 font-sans text-base text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      />
      <fieldset className="mt-5">
        <legend className="label mb-3">Filter groups</legend>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              aria-pressed={selected.has(group)}
              onClick={() => toggleGroup(group)}
              className="toggle"
            >
              {groupNames[group]}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="source mt-5" aria-live="polite">
        {filtered.length} of {symbols.length} entries
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((symbol) => (
          <li
            key={symbol.glyph}
            className="rounded-sm border border-white/20 bg-white/[0.03] p-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-3xl" aria-label={symbol.name}>
                {symbol.glyph}
              </span>
              <span className="source">{symbol.name}</span>
            </div>
            <p className="label mt-3">{groupNames[symbol.group]}</p>
            <ul className="mt-2 space-y-1 text-base leading-relaxed text-white/80">
              {symbol.meanings.map((meaning) => (
                <li key={meaning}>{meaning}</li>
              ))}
            </ul>
            {symbol.tex?.length ? (
              <p className="source mt-2">TeX: {symbol.tex.join(", ")}</p>
            ) : null}
            {symbol.example ? (
              <p className="mt-2 font-sans text-sm text-white/60">
                Example: {symbol.example}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-white/70">No matching symbols.</p>
      ) : null}
    </div>
  );
}
