"""Run circuits in quantum/circuits on the Aer simulator or IBM hardware.

Usage:
  python quantum/run.py --target simulator --all
  python quantum/run.py --target ibm-hardware --circuit bell.py --shots 1024
"""
import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path

from qiskit import transpile

CIRCUITS = Path(__file__).parent / "circuits"
RESULTS = Path("results")
MAX_HW_SHOTS = 4000


def load(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.build()


def run_simulator(qc, shots):
    from qiskit_aer import AerSimulator

    sim = AerSimulator()
    counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()
    return {"backend": "aer_simulator", "counts": counts}


def run_hardware(qc, shots):
    token = os.environ.get("IBM_QUANTUM_TOKEN")
    instance = os.environ.get("IBM_QUANTUM_INSTANCE")
    if not token or not instance:
        sys.exit("IBM_QUANTUM_TOKEN / IBM_QUANTUM_INSTANCE are not set in the ibm-quantum environment.")
    if shots > MAX_HW_SHOTS:
        sys.exit(f"Refusing {shots} shots on hardware (cap {MAX_HW_SHOTS}) to protect the free-tier minutes.")

    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

    service = QiskitRuntimeService(channel="ibm_quantum_platform", token=token, instance=instance)
    backend = service.least_busy(operational=True, simulator=False)
    isa = generate_preset_pass_manager(backend=backend, optimization_level=1).run(qc)
    job = SamplerV2(mode=backend).run([isa], shots=shots)
    print(f"Submitted job {job.job_id()} to {backend.name}; waiting...", flush=True)
    counts = job.result()[0].join_data().get_counts()
    return {"backend": backend.name, "job_id": job.job_id(), "counts": counts}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--target", choices=["simulator", "ibm-hardware"], default="simulator")
    p.add_argument("--circuit", help="file name in quantum/circuits, e.g. bell.py")
    p.add_argument("--all", action="store_true", help="run every circuit (simulator only)")
    p.add_argument("--shots", type=int, default=1024)
    a = p.parse_args()

    if a.all and a.target != "simulator":
        sys.exit("--all is simulator-only.")
    files = sorted(CIRCUITS.glob("*.py")) if a.all else [CIRCUITS / (a.circuit or "bell.py")]

    RESULTS.mkdir(exist_ok=True)
    summary = ["| Circuit | Backend | Top outcomes |", "|---|---|---|"]
    for f in files:
        qc = load(f)
        out = run_simulator(qc, a.shots) if a.target == "simulator" else run_hardware(qc, a.shots)
        out.update(circuit=f.name, shots=a.shots, target=a.target)
        (RESULTS / f"{f.stem}-{a.target}.json").write_text(json.dumps(out, indent=2))
        top = sorted(out["counts"].items(), key=lambda kv: -kv[1])[:4]
        summary.append(f"| {f.name} | {out['backend']} | " + ", ".join(f"`{k}`: {v}" for k, v in top) + " |")
        print(json.dumps(out))

    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a") as fh:
            fh.write("\n".join(summary) + "\n")


if __name__ == "__main__":
    main()
