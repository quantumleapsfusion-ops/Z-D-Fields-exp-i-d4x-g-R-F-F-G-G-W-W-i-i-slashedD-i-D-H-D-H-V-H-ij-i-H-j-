import { FeatureBlock } from '@/components/FeatureBlock';
import { features, site } from '@/lib/site';

export function Features() {
  return (
    <section id="four-ways-to-speak" className="mx-auto max-w-5xl px-5 sm:px-8">
      <h2 className="sr-only">{site.tagline}</h2>
      <div className="hairline" />
      <div className="divide-y divide-chalk/10">
        {features.map((feature) => (
          <FeatureBlock key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
