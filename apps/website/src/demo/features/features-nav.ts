import {
  Blocks,
  FileSpreadsheet,
  FileText,
  Languages,
  Map as MapIcon,
  Palette,
  RadioTower,
  Type,
  type LucideIcon,
} from "lucide-react";

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
  {
    slug: "realtime",
    title: "Realtime",
    icon: RadioTower,
    blurb:
      "Cross-tab live updates over a BroadcastChannel — edit here, see it there.",
  },
  {
    slug: "csv-import",
    title: "CSV Import",
    icon: FileSpreadsheet,
    blurb: "Bulk-import rows from a CSV straight into a resource list.",
  },
  {
    slug: "mdx-editor",
    title: "MDX Editor",
    icon: FileText,
    blurb: "Author MDX content with a rich WYSIWYG editor inside a form.",
  },
  {
    slug: "rich-text",
    title: "Rich Text",
    icon: Type,
    blurb: "A TipTap-powered rich text input with a formatting toolbar.",
  },
  {
    slug: "block-editor",
    title: "Block Editor",
    icon: Blocks,
    blurb: "Notion-style block editing for structured documents.",
  },
  {
    slug: "themes",
    title: "Themes",
    icon: Palette,
    blurb: "Swap shadcn theme presets live and watch the UI restyle.",
  },
  {
    slug: "i18n",
    title: "I18N",
    icon: Languages,
    blurb:
      "Switch locale (English / French) and translate fields per-language.",
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
