import { Animated } from "@earth-one/ui";

import { CiceroReveal } from "@/components/CiceroReveal";
import { Orbital } from "@/components/Orbital";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <h1 className="sr-only">
        {site.org} — {site.motto}
      </h1>
      {/* Decorative orbital: below the text on small screens, right and vertically centred from lg up. */}
      <Animated
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 w-[130vw] -translate-x-1/2 translate-y-[55%] lg:top-1/2 lg:right-[-8vw] lg:bottom-auto lg:left-auto lg:w-[min(52vw,760px)] lg:translate-x-0 lg:-translate-y-1/2"
      >
        <Orbital className="text-text-3 h-auto w-full" />
      </Animated>
      <div className="page relative flex min-h-[calc(100svh-96px)] flex-col justify-center pt-20 pb-[48vw] sm:pt-32 lg:py-32">
        <CiceroReveal />
      </div>
    </section>
  );
}
