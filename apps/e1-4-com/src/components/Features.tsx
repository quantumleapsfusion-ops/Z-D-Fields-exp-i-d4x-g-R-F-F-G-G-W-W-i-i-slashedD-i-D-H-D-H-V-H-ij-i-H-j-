import Link from "next/link";

import { isFeatureEnabled } from "@/lib/features";
import { daVinci, features, site } from "@/lib/site";

export function Features() {
  return (
    <section id="dimensions" className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
      <h2 className="sr-only">{site.tagline}</h2>
      <div className="flex flex-col gap-7">
        {features.map((feature) => (
          <article key={feature.title}>
            <div className="flex items-baseline gap-3 font-sans text-base">
              {isFeatureEnabled(feature) ? (
                <Link href={feature.href} className="hover:text-ochre">
                  {feature.dimension}D {feature.title}
                </Link>
              ) : (
                <>
                  <span>
                    {feature.dimension}D {feature.title}
                  </span>
                  <span className="text-dust">soon</span>
                </>
              )}
            </div>
            <p className="text-dust mt-1 font-sans text-sm">{feature.body}</p>
          </article>
        ))}
        <article>
          <p className="font-sans text-base">
            Da Vinci. Floats between every dimension. Ctrl+K on any surface.
          </p>
          <p className="text-dust mt-1 font-sans text-sm">{daVinci.body}</p>
        </article>
      </div>
    </section>
  );
}
