import type { Equation } from "@/lib/site";

import { PlaceholderFrame } from "./PlaceholderFrame";

/**
 * The visible equation is the founder's handwriting (photographed); until it arrives the
 * frame is a labelled placeholder. A typeset MathML copy sits underneath for screen
 * readers and copy/paste — it is not the design.
 */
export function EquationEntry({ eq, index }: { eq: Equation; index: number }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3.5rem_1fr]">
      <span className="mono text-ink-3 pt-1">({index + 1})</span>
      <div>
        <PlaceholderFrame
          id={eq.id}
          needs={`photo of handwritten ${eq.text} on paper or slate`}
          aspect="16 / 7"
          className="mb-3 max-w-xl"
        >
          <math
            display="block"
            className="text-ink-2 absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl"
            aria-label={eq.name}
            dangerouslySetInnerHTML={{ __html: eq.mathml }}
          />
        </PlaceholderFrame>
        <p className="max-w-md italic">{eq.caption}</p>
      </div>
    </li>
  );
}
