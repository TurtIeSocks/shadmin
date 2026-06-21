import { Map as MapIcon, type LucideIcon } from "lucide-react";

/**
 * One feature demo: a bigger-than-one-component integration shown end-to-end.
 * Each entry has a module at ./demos/<slug>.tsx (default-exporting the demo).
 */
export interface FeatureMeta {
  slug: string;
  title: string;
  icon: LucideIcon;
  blurb: string;
}

// Ordered registry — drives the sidebar Features zone and the landing cards.
export const FEATURES: FeatureMeta[] = [
  {
    slug: "map",
    title: "Map",
    icon: MapIcon,
    blurb:
      "Plot records on an interactive Leaflet map, straight from the data.",
  },
];

export const FEATURE_BY_SLUG: Record<string, FeatureMeta> = Object.fromEntries(
  FEATURES.map((f) => [f.slug, f]),
);

export const featureSlugs = FEATURES.map((f) => f.slug);

// Lazy demo modules, keyed ./demos/<slug>.tsx.
export const featureModules = import.meta.glob("./demos/*.tsx");

/** slug → glob key for `featureModules`. */
export function slugToKey(slug: string): string {
  return `./demos/${slug}.tsx`;
}
