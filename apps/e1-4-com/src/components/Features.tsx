import { FeatureBlock } from "@/components/FeatureBlock";
import { isFeatureEnabled } from "@/lib/features";
import { features, site } from "@/lib/site";

export function Features() {
  return (
    <section id="four-ways-to-speak" className="page scroll-mt-24 py-20 sm:py-28">
      <h2 className="font-display text-[2rem] leading-none font-light tracking-tight sm:text-[2.75rem]">
        {site.subhead}
      </h2>
      <ul className="mt-12 grid gap-4 sm:gap-6 lg:grid-cols-6">
        {features.map((feature) => (
          <li
            key={feature.title}
            className={feature.emphasis ? "lg:col-span-6" : "lg:col-span-2"}
          >
            <FeatureBlock feature={feature} enabled={isFeatureEnabled(feature)} />
          </li>
        ))}
      </ul>
      <p className="label mt-10 leading-relaxed">{site.keywordLine}</p>
    </section>
  );
}
