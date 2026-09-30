import type { PinPhase } from "@/features/codex/PinField";
import type { Form } from "@/lib/gravity/superposition";
import type { StageId } from "@/lib/journey";

/** How the pin field shows each dimension: `cycling` flickers in superposition, `observed` stays. */
export function pinsFor(id: StageId, cycling: Form, observed: Form): [PinPhase, Form] {
  switch (id) {
    case "voice":
      return ["line", observed];
    case "board":
      return ["board", observed];
    case "gravity":
      return ["relief", observed];
    case "horizon":
      return ["well", observed];
    case "superposition":
      return ["form", cycling];
    case "observed":
      return ["form", observed];
  }
}
