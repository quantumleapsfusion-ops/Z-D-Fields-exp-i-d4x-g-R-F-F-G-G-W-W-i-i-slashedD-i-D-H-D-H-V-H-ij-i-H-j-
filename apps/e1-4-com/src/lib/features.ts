import { flags } from "@/lib/flags";
import { features, type Feature } from "@/lib/site";

export function isFeatureEnabled(feature: Feature): boolean {
  if (feature.href === "/gravity") return flags.gravityChalkboard;
  if (feature.href === "/horizon") return flags.eventHorizon;
  if (feature.href === "/superposition") return flags.superposition;
  return true;
}

export const enabledFeatures = () => features.filter(isFeatureEnabled);
