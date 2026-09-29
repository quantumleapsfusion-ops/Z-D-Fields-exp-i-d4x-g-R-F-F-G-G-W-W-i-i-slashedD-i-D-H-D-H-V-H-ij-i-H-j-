import Link from "next/link";

import { Animated } from "@earth-one/ui";
import { statusLabel, type Feature } from "@/lib/site";

export function FeatureBlock({
  feature,
  enabled,
}: {
  feature: Feature;
  enabled: boolean;
}) {
  const { title, codenames, body, emphasis, href, status } = feature;

  return (
    <article
      className={`card relative flex h-full flex-col overflow-hidden ${
        emphasis
          ? "border-accent/30 p-7 pb-[52vw] sm:p-10 sm:pb-10 lg:p-14"
          : "p-7 sm:p-8"
      }`}
    >
      {emphasis ? <EventHorizon /> : null}

      <div className="relative flex h-full flex-col">
        <p className="label min-h-[1em]">{codenames}</p>
        <h3
          className={`font-display mt-6 font-medium tracking-tight ${
            emphasis ? "text-[2rem] sm:text-[2.75rem]" : "text-xl sm:text-2xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-text-2 mt-4 font-sans leading-relaxed ${
            emphasis ? "max-w-2xl text-base sm:text-lg" : "text-[15px]"
          }`}
        >
          {body}
        </p>

        <div className="mt-auto flex items-center gap-5 pt-8">
          {enabled ? (
            <Link
              href={href}
              className="text-accent hover:text-text inline-flex min-h-11 items-center gap-2 font-sans text-sm font-medium transition-colors"
            >
              Open {title}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="text-text-3 inline-flex min-h-11 items-center font-sans text-sm">
              Coming soon
            </span>
          )}
          <span className="label">{statusLabel[status]}</span>
        </div>
      </div>
    </article>
  );
}

/** Decorative event-horizon rings for the Gravity Board card; stays visible under reduced motion. */
function EventHorizon() {
  return (
    <Animated
      aria-hidden
      className="pointer-events-none absolute right-[-15%] bottom-[-30%] w-[80%] max-w-[560px] sm:top-1/2 sm:right-[-8%] sm:bottom-auto sm:w-[52%] sm:-translate-y-1/2"
    >
      <svg viewBox="0 0 400 400" fill="none" className="text-accent h-auto w-full">
        <circle
          cx="200"
          cy="200"
          r="190"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="150"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="3 7"
          className="animate-orbit origin-center"
          style={{ animationDuration: "80s" }}
        />
        <circle
          cx="200"
          cy="200"
          r="112"
          stroke="currentColor"
          strokeWidth="1.5"
          className="animate-horizon origin-center"
        />
        <circle cx="200" cy="200" r="64" fill="#050507" />
        <circle
          cx="200"
          cy="200"
          r="64"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1"
        />
      </svg>
    </Animated>
  );
}
