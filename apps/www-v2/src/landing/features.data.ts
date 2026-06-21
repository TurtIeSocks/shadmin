import {
  AlignJustify,
  ArrowDownUp,
  BugOff,
  CalendarDays,
  Command,
  Earth,
  FileSpreadsheet,
  KeyRound,
  MapPin,
  NotepadText,
  Palette,
  Pilcrow,
  RadioTower,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Tailwind col/row span classes for the asymmetric bento layout. */
export type FeatureSpan = "large" | "tall" | "wide" | undefined;

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  span?: FeatureSpan;
}

export const features: Feature[] = [
  {
    title: "Data Maps",
    description: "Interactive Leaflet maps with geospatial data layers",
    icon: MapPin,
    span: "large",
  },
  {
    title: "Lists & Data Tables",
    description: "Flexible lists & tables for displaying data collections",
    icon: AlignJustify,
    span: "tall",
  },
  {
    title: "Command Menu",
    description:
      "A ⌘K command palette for instant keyboard-driven navigation",
    icon: Command,
    span: "wide",
  },
  {
    title: "AI-Ready",
    description: "Ships with an MCP server — scaffold and edit admin UIs with AI",
    icon: Sparkles,
    span: "large",
  },
  {
    title: "Flexible Theming",
    description: "Theme presets, light/dark mode & granular styling",
    icon: Palette,
    span: "wide",
  },
  {
    title: "Forms & Validation",
    description: "Data-bound inputs, adaptable layouts, dynamic fields",
    icon: NotepadText,
    span: "wide",
  },
  {
    title: "Roles & Permissions",
    description: "Fine-grained RBAC, per-resource and per-action",
    icon: ShieldCheck,
  },
  {
    title: "Data Fetching",
    description: "Efficient hooks for robust API interactions",
    icon: ArrowDownUp,
  },
  {
    title: "Authentication",
    description: "Secure auth flows and user management",
    icon: KeyRound,
  },
  {
    title: "Search & Filtering",
    description: "Search-as-you-type and combined filters",
    icon: ScanSearch,
  },
  {
    title: "I18n",
    description: "Internationalization for global applications",
    icon: Earth,
  },
  {
    title: "Realtime",
    description: "Live updates with any realtime backend",
    icon: RadioTower,
  },
  {
    title: "CSV Import / Export",
    description: "Bulk data import and export with spreadsheet support",
    icon: FileSpreadsheet,
  },
  {
    title: "Rich Text Editor",
    description: "WYSIWYG editing with full formatting and media",
    icon: Pilcrow,
  },
  {
    title: "Kanban & Scheduling",
    description: "Drag-and-drop boards and calendar views",
    icon: CalendarDays,
  },
  {
    title: "Resilient UI",
    description: "Gracefully manages loading, empty, and error states",
    icon: BugOff,
  },
];

export const spanClasses: Record<string, string> = {
  large: "sm:col-span-2 sm:row-span-2",
  tall: "sm:row-span-2",
  wide: "sm:col-span-2",
};
