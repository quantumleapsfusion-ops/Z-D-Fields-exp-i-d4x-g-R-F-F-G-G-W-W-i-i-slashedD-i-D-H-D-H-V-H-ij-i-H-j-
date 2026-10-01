"use client";

import { useMemo, useState } from "react";

/** Amplitudes of |00⟩, |01⟩, |10⟩, |11⟩. Real numbers are enough for H, X, Z and CNOT. */
type State = [number, number, number, number];
type Gate = "H1" | "H2" | "X1" | "X2" | "Z1" | "Z2" | "CNOT";

const R = Math.SQRT1_2;
const INITIAL: State = [1, 0, 0, 0];
const LABELS = ["00", "01", "10", "11"];

const GATES: { id: Gate; label: string }[] = [
  { id: "H1", label: "H on qubit 1" },
  { id: "H2", label: "H on qubit 2" },
  { id: "X1", label: "X on qubit 1" },
  { id: "X2", label: "X on qubit 2" },
  { id: "Z1", label: "Z on qubit 1" },
  { id: "Z2", label: "Z on qubit 2" },
  { id: "CNOT", label: "CNOT 1 → 2" },
];

// Qubit 1 is the left digit of the label, qubit 2 the right.
function apply([a, b, c, d]: State, gate: Gate): State {
  switch (gate) {
    case "H1":
      return [R * (a + c), R * (b + d), R * (a - c), R * (b - d)];
    case "H2":
      return [R * (a + b), R * (a - b), R * (c + d), R * (c - d)];
    case "X1":
      return [c, d, a, b];
    case "X2":
      return [b, a, d, c];
    case "Z1":
      return [a, b, -c, -d];
    case "Z2":
      return [a, -b, c, -d];
    case "CNOT":
      return [a, b, d, c];
  }
}

/** Two simulated qubits: build a circuit, then measure it. */
export function QubitLab() {
  const [state, setState] = useState<State>(INITIAL);
  const [circuit, setCircuit] = useState<Gate[]>([]);
  const [tally, setTally] = useState([0, 0, 0, 0]);

  const probs = useMemo(() => state.map((x) => x * x), [state]);
  const shots = tally.reduce((x, y) => x + y, 0);

  const run = (gate: Gate) => {
    setState((s) => apply(s, gate));
    setCircuit((c) => [...c, gate]);
    setTally([0, 0, 0, 0]);
  };
  const reset = () => {
    setState(INITIAL);
    setCircuit([]);
    setTally([0, 0, 0, 0]);
  };
  const measure = (times: number) => {
    const next = [...tally];
    for (let i = 0; i < times; i += 1) {
      let r = Math.random();
      let k = 0;
      for (; k < 3; k += 1) {
        r -= probs[k];
        if (r < 0) break;
      }
      next[k] += 1;
    }
    setTally(next);
  };

  return (
    <figure className="my-10 rounded-sm border border-white/20 p-5">
      <p className="source mb-4">
        Two qubits, starting at |00⟩. Add gates, then measure. Try H on qubit 1, then
        CNOT, and measure a thousand times: only 00 and 11 appear, about half each, and
        never 01 or 10. That is an entangled pair.
      </p>
      <div className="flex flex-wrap gap-2">
        {GATES.map((g) => (
          <button key={g.id} type="button" className="toggle" onClick={() => run(g.id)}>
            {g.label}
          </button>
        ))}
        <button type="button" className="toggle" onClick={reset}>
          Reset
        </button>
      </div>
      <p className="source mt-4 min-h-6 font-mono">
        circuit: {circuit.length ? circuit.join(" → ") : "(empty)"}
      </p>
      <ul className="mt-4 space-y-3">
        {LABELS.map((label, i) => (
          <li key={label} className="grid grid-cols-[3rem_1fr_8rem] items-center gap-3">
            <span className="font-mono text-sm text-white/80">|{label}⟩</span>
            <span className="relative h-4 bg-white/10" aria-hidden="true">
              <span
                className="absolute inset-y-0 left-0 bg-white/80 transition-[width] duration-500"
                style={{ width: `${probs[i] * 100}%` }}
              />
              {shots > 0 ? (
                <span
                  className="absolute inset-y-1 left-0 bg-sky-300"
                  style={{ width: `${(tally[i] / shots) * 100}%` }}
                />
              ) : null}
            </span>
            <span className="source font-mono">
              {state[i] < -1e-9 ? "−" : "+"}
              {Math.abs(state[i]).toFixed(3)}
              {shots > 0 ? ` · ${tally[i]}` : ""}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="toggle" onClick={() => measure(1)}>
          Measure once
        </button>
        <button type="button" className="toggle" onClick={() => measure(1000)}>
          Measure 1000 times
        </button>
      </div>
      <figcaption className="source mt-3">
        White bars: the probability from each amplitude (its sign is the phase, which you
        cannot see directly but interference can). Blue bars: what your measurements
        found. Try H, then Z, then H on the same qubit and watch the hidden phase turn a 0
        into a 1.
      </figcaption>
    </figure>
  );
}
