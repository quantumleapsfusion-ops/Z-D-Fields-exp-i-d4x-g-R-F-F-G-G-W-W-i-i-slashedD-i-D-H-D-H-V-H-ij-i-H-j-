import { isFeatureEnabled } from "@/lib/features";
import { features, type Dimension, type Feature } from "@/lib/site";

export function dimensionOf(pathname: string): Feature | null {
  return (
    [...features]
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (feature) => pathname === feature.href || pathname.startsWith(`${feature.href}/`),
      ) ?? null
  );
}

export function neighbour(pathname: string, step: 1 | -1): Feature | null {
  const current = dimensionOf(pathname);
  if (!current) return null;
  const ladder = features
    .filter(isFeatureEnabled)
    .sort((a, b) => a.dimension - b.dimension);
  const index = ladder.findIndex((feature) => feature.dimension === current.dimension);
  return ladder[index + step] ?? null;
}

export function byDimension(dimension: Dimension): Feature | undefined {
  return features.find((feature) => feature.dimension === dimension);
}
