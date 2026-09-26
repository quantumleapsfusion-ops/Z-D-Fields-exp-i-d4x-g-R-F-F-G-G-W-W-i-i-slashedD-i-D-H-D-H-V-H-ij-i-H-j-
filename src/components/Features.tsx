import { FeatureBlock } from "@/components/FeatureBlock";
import { isFeatureEnabled } from "@/lib/features";
import { features, site } from "@/lib/site";

export function Features() {
  return (
    <section id="four-ways-to-speak" className="mx-auto max-w-5xl px-5 sm:px-8">
      <h2 className="sr-only">{site.tagline}</h2>
      <div className="hairline" />
      <div className="divide-chalk/10 divide-y">
        {features.map((feature) => (
          <FeatureBlock
            key={feature.title}
            feature={feature}
            enabled={isFeatureEnabled(feature)}
          />
        ))}
      </div>
    </section>
  );
}
