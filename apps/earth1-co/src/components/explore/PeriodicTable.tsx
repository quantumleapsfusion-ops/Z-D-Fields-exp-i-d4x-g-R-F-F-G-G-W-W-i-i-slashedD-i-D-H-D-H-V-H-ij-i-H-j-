"use client";

import { useMemo, useState } from "react";

import { electronsByShell, elements, type Element } from "@/lib/explore/elements";

type ColourMode = "category" | "block" | "phase" | "electronegativity";

const categoryColours: Record<Element["category"], string> = {
  "alkali-metal": "#8f463e",
  "alkaline-earth-metal": "#96713d",
  lanthanide: "#69558e",
  actinide: "#854f72",
  "transition-metal": "#48617a",
  "post-transition-metal": "#467c72",
  metalloid: "#829344",
  "reactive-nonmetal": "#367a57",
  "noble-gas": "#397d91",
  unknown: "#62626a",
};
const blockColours: Record<Element["block"], string> = {
  s: "#775a92",
  p: "#33756a",
  d: "#41698c",
  f: "#8e5b46",
};
const phaseColours: Record<Element["phase"], string> = {
  solid: "#526578",
  liquid: "#2789a7",
  gas: "#956a39",
  unknown: "#505058",
};
const categoryLabels: Record<Element["category"], string> = {
  "alkali-metal": "Alkali metal",
  "alkaline-earth-metal": "Alkaline-earth metal",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  "transition-metal": "Transition metal",
  "post-transition-metal": "Post-transition metal",
  metalloid: "Metalloid",
  "reactive-nonmetal": "Reactive nonmetal",
  "noble-gas": "Noble gas",
  unknown: "Unknown",
};

function shellDiagram(element: Element) {
  const shells = electronsByShell(element.config);
  const cx = 92;
  const cy = 92;
  return (
    <svg
      viewBox="0 0 184 184"
      role="img"
      aria-label={`${element.name} Bohr-style shell diagram: ${shells.join(", ")} electrons by shell`}
      className="mx-auto mt-2 h-48 w-48"
    >
      {shells.map((count, shellIndex) => {
        const radius = 18 + shellIndex * 10;
        return (
          <g key={shellIndex}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
            />
            {Array.from({ length: count }, (_, electronIndex) => {
              const angle = (electronIndex / count) * Math.PI * 2 - Math.PI / 2;
              return (
                <circle
                  key={electronIndex}
                  cx={cx + Math.cos(angle) * radius}
                  cy={cy + Math.sin(angle) * radius}
                  r="2.5"
                  fill="#9bd8ff"
                />
              );
            })}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="7" fill="#f5c66a" />
    </svg>
  );
}

export function PeriodicTable() {
  const [colourBy, setColourBy] = useState<ColourMode>("category");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Element | null>(elements[0]);
  const needle = query.trim().toLocaleLowerCase();
  const matches = useMemo(
    () =>
      new Set(
        elements
          .filter(
            (element) =>
              needle &&
              `${element.name} ${element.symbol}`.toLocaleLowerCase().includes(needle),
          )
          .map((element) => element.z),
      ),
    [needle],
  );
  const fBlock = elements.filter((element) => element.group === null);

  function background(element: Element) {
    if (colourBy === "category") return categoryColours[element.category];
    if (colourBy === "block") return blockColours[element.block];
    if (colourBy === "phase") return phaseColours[element.phase];
    if (element.electronegativity === null) return "#55545a";
    const ratio = Math.min(1, Math.max(0, element.electronegativity / 4));
    const red = Math.round(70 + 150 * ratio);
    const green = Math.round(105 - 50 * ratio);
    const blue = Math.round(170 - 95 * ratio);
    return `rgb(${red} ${green} ${blue})`;
  }

  return (
    <div className="mt-8">
      <label htmlFor="element-search" className="label block">
        Find an element
      </label>
      <input
        id="element-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name or symbol"
        className="mt-2 w-full border border-white/30 bg-black/50 px-4 py-3 font-sans text-base text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      />
      <fieldset className="mt-5">
        <legend className="label mb-3">Colour by</legend>
        <div className="flex flex-wrap gap-2">
          {(["category", "block", "phase", "electronegativity"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={colourBy === mode}
              onClick={() => setColourBy(mode)}
              className="toggle"
            >
              {mode === "electronegativity" ? "Pauling EN" : mode}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="source mt-4">
        Select a tile to inspect its properties and electron shells. Table scrolls
        horizontally on small screens.
      </p>
      <div className="mt-4 overflow-x-auto pb-4">
        <div
          aria-label="Interactive periodic table"
          className="relative grid min-w-[900px] grid-cols-[repeat(18,minmax(2.7rem,1fr))] gap-1"
        >
          {elements
            .filter((element) => element.group !== null)
            .map((element) => {
              const isMatch = matches.has(element.z);
              return (
                <button
                  key={element.z}
                  type="button"
                  aria-label={`${element.name}, atomic number ${element.z}, group ${element.group}, period ${element.period}`}
                  aria-pressed={selected?.z === element.z}
                  onClick={() => setSelected(element)}
                  style={{
                    gridColumn: element.group!,
                    gridRow: element.period,
                    backgroundColor: background(element),
                  }}
                  className={`relative flex min-h-[4.15rem] flex-col items-center justify-center rounded-sm border p-1 font-sans text-white transition-opacity focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-white ${
                    isMatch
                      ? "ring-2 ring-white ring-offset-1 ring-offset-black"
                      : "border-white/15"
                  } ${needle && !isMatch ? "opacity-40" : "opacity-100"} ${
                    selected?.z === element.z ? "border-white" : ""
                  }`}
                >
                  <span className="absolute top-0.5 left-1 text-[0.58rem] leading-none">
                    {element.z}
                  </span>
                  <span className="mt-1 text-lg leading-none font-semibold">
                    {element.symbol}
                  </span>
                  <span className="mt-1 text-[0.55rem] leading-none">{element.mass}</span>
                </button>
              );
            })}
        </div>
      </div>
      <section
        aria-label="Lanthanides and actinides"
        className="mt-3 overflow-x-auto pb-4"
      >
        <div className="min-w-[900px] space-y-1">
          {(["lanthanide", "actinide"] as const).map((category) => (
            <div
              key={category}
              className="grid grid-cols-[repeat(15,minmax(2.7rem,1fr))] gap-1"
            >
              <span className="flex items-center text-[0.65rem] text-white/55">
                {category === "lanthanide" ? "Lanthanides" : "Actinides"}
              </span>
              {fBlock
                .filter((element) => element.category === category)
                .map((element) => (
                  <button
                    key={element.z}
                    type="button"
                    aria-label={`${element.name}, atomic number ${element.z}`}
                    aria-pressed={selected?.z === element.z}
                    onClick={() => setSelected(element)}
                    style={{ backgroundColor: background(element) }}
                    className={`relative flex min-h-[4.15rem] flex-col items-center justify-center rounded-sm border border-white/15 p-1 font-sans text-white focus-visible:outline-2 focus-visible:outline-white ${
                      matches.has(element.z) ? "ring-2 ring-white" : ""
                    } ${needle && !matches.has(element.z) ? "opacity-40" : ""}`}
                  >
                    <span className="absolute top-0.5 left-1 text-[0.58rem]">
                      {element.z}
                    </span>
                    <span className="mt-1 text-lg font-semibold">{element.symbol}</span>
                    <span className="text-[0.55rem]">{element.mass}</span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </section>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70">
        {(colourBy === "category"
          ? Object.entries(categoryColours).map(([key, color]) => [
              categoryLabels[key as Element["category"]],
              color,
            ])
          : colourBy === "block"
            ? Object.entries(blockColours).map(([key, color]) => [`${key}-block`, color])
            : colourBy === "phase"
              ? Object.entries(phaseColours).map(([key, color]) => [key, color])
              : [
                  ["lower electronegativity", "#4669aa"],
                  ["higher electronegativity", "#dc3760"],
                  ["not assigned", "#55545a"],
                ]
        ).map(([label, color]) => (
          <span key={label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
      {selected ? (
        <section
          aria-labelledby="element-detail-heading"
          className="mt-8 grid gap-6 border border-white/20 bg-white/[0.03] p-5 lg:grid-cols-[1fr_14rem]"
        >
          <div>
            <h2 id="element-detail-heading" className="text-2xl">
              {selected.name} <span className="text-white/55">({selected.symbol})</span>
            </h2>
            <p className="source mt-1">
              Atomic number {selected.z} · {categoryLabels[selected.category]}
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-3 font-sans text-sm sm:grid-cols-2">
              {[
                ["Atomic mass", selected.mass],
                ["Group / period", `${selected.group ?? "f-block"} / ${selected.period}`],
                ["Block", selected.block],
                ["Phase at 0 °C, 1 atm", selected.phase],
                ["Ground-state configuration", selected.config],
                [
                  "Pauling electronegativity",
                  selected.electronegativity?.toString() ?? "Not assigned",
                ],
                ["Discovered", selected.discovered],
                ["Fact", selected.fact],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-white/55">{label}</dt>
                  <dd className="mt-1 text-white/90">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="text-center">
            {shellDiagram(selected)}
            <p className="source">Electrons per shell</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
