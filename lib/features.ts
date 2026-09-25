import { flags } from '@/lib/flags';
import { features, type Feature } from '@/lib/site';

export function isFeatureEnabled(feature: Feature): boolean {
  if (feature.href === '/gravity') return flags.gravityBoard;
  return true;
}

export const enabledFeatures = () => features.filter(isFeatureEnabled);
