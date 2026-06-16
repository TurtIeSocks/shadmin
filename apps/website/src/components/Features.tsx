import {
  ArrowDownUp,
  AlignJustify,
  NotepadText,
  KeyRound,
  ScanSearch,
  Earth,
  Palette,
  BugOff,
  MapPin,
  RadioTower,
  FileSpreadsheet,
  Pilcrow,
  Command,
  CalendarDays,
  ShieldCheck,
  Search,
  Sparkles,
} from "lucide-react";
import type { CSSProperties } from "react";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";
import { cn } from "@/lib/utils";

// span: undefined = 1×1, "wide" = 2×1, "tall" = 1×2, "hero" = 2×2.
// Cell budget tiles to whole rows: 2 heroes(4) + 1 tall(2) + 1 wide(2) + 12×1 = 24 = 8 rows × 3 cols.
type Span = "wide" | "tall" | "hero" | undefined;

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  span: Span;
}

const features: Feature[] = [
  {
    name: "Data Maps",
    description: "Interactive Leaflet maps with geospatial data layers",
    icon: MapPin,
    span: "hero",
  },
  {
    name: "Lists & Data Tables",
    description: "Flexible lists & tables for displaying data collections",
    icon: AlignJustify,
    span: "tall",
  },
  {
    name: "AI-Ready",
    description:
      "Ships with an MCP server — scaffold and edit admin UIs with AI",
    icon: Sparkles,
    span: "hero",
  },
  {
    name: "Data Fetching",
    description: "Efficient hooks for robust API interactions",
    icon: ArrowDownUp,
    span: undefined,
  },
  {
    name: "Authentication",
    description: "Secure auth flows and user management",
    icon: KeyRound,
    span: undefined,
  },
  {
    name: "Command Menu",
    description: "A ⌘K command palette for instant keyboard-driven navigation",
    icon: Command,
    span: "wide",
  },
  {
    name: "Search & Filtering",
    description: "Search-as-you-type and combined filters",
    icon: ScanSearch,
    span: undefined,
  },
  {
    name: "Flexible Theming",
    description: "Theme presets, light/dark mode & granular styling",
    icon: Palette,
    span: undefined,
  },
  {
    name: "I18n",
    description: "Internationalization for global applications",
    icon: Earth,
    span: undefined,
  },
  {
    name: "Realtime",
    description: "Live updates with any realtime backend",
    icon: RadioTower,
    span: undefined,
  },
  {
    name: "CSV Import / Export",
    description: "Bulk data import and export with spreadsheet support",
    icon: FileSpreadsheet,
    span: undefined,
  },
  {
    name: "Rich Text Editor",
    description: "WYSIWYG editing with full formatting and media",
    icon: Pilcrow,
    span: undefined,
  },
  {
    name: "Kanban & Scheduling",
    description: "Drag-and-drop boards and calendar views",
    icon: CalendarDays,
    span: undefined,
  },
  {
    name: "Roles & Permissions",
    description: "Fine-grained RBAC, per-resource and per-action",
    icon: ShieldCheck,
    span: undefined,
  },
  {
    name: "Forms & Validation",
    description: "Data-bound inputs, adaptable layouts, dynamic fields",
    icon: NotepadText,
    span: undefined,
  },
  {
    name: "Resilient UI",
    description: "Gracefully manages loading, empty, and error states",
    icon: BugOff,
    span: undefined,
  },
];

// ── Mini-visuals (each fills its card via h-full) ──────────────────────────────

function MapVisual() {
  const pins = new Set([12, 26, 43, 51]);
  const cells = 8 * 7;
  return (
    <div className="grid h-full grid-cols-8 grid-rows-7 place-items-center gap-1.5">
      {Array.from({ length: cells }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            pins.has(i) ? "size-2.5 bg-aurora" : "size-1.5 bg-foreground/10",
          )}
          style={
            pins.has(i)
              ? { boxShadow: "0 0 8px 2px rgba(127,119,221,0.45)" }
              : undefined
          }
        />
      ))}
    </div>
  );
}

function DataTableVisual() {
  const rows = [
    { w: "w-20", color: "#22c55e" },
    { w: "w-14", color: "#22c55e" },
    { w: "w-24", color: "#f59e0b" },
    { w: "w-16", color: "#ef4444" },
  ];
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-1 items-center gap-3 rounded-lg bg-foreground/5 px-3"
        >
          <span className="size-5 shrink-0 rounded-full bg-foreground/10" />
          <span className={cn("h-2 rounded bg-foreground/15", row.w)} />
          <span
            className="ml-auto size-2 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
        </div>
      ))}
    </div>
  );
}

function AIVisual() {
  const lines = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-11/12", "w-1/2"];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
        <Sparkles size={14} style={{ color: "#7f77dd" }} className="shrink-0" />
        <span className="flex-1 truncate text-xs text-muted-foreground">
          Generate an admin for my API…
        </span>
        <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ↵
        </kbd>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2">
        {lines.map((w, i) => (
          <span
            key={i}
            className={cn(
              "h-2 rounded",
              i % 2 === 0 ? "bg-foreground/15" : "bg-foreground/10",
              w,
            )}
          />
        ))}
      </div>
    </div>
  );
}

function CommandMenuVisual() {
  return (
    <div className="flex h-full items-center">
      <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm text-muted-foreground">Search…</span>
        <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

function ThemingVisual() {
  const swatches: { className?: string; style?: CSSProperties }[] = [
    { className: "bg-aurora" },
    { style: { backgroundColor: "#7f77dd" } },
    { style: { backgroundColor: "#d4537e" } },
    { style: { backgroundColor: "#1d9e75" } },
    { style: { backgroundColor: "#378add" } },
  ];
  return (
    <div className="flex h-full items-center gap-2">
      {swatches.map((s, i) => (
        <span
          key={i}
          className={cn("size-7 shrink-0 rounded-lg", s.className)}
          style={s.style}
        />
      ))}
    </div>
  );
}

const VISUALS: Record<string, () => React.ReactElement> = {
  "Data Maps": MapVisual,
  "Lists & Data Tables": DataTableVisual,
  "AI-Ready": AIVisual,
  "Command Menu": CommandMenuVisual,
  "Flexible Theming": ThemingVisual,
};

function spanClasses(span: Span) {
  if (span === "hero") return "md:col-span-2 md:row-span-2";
  if (span === "wide") return "md:col-span-2";
  if (span === "tall") return "md:row-span-2";
  return "";
}

const isBig = (span: Span) => span === "hero" || span === "tall";

export function Features() {
  return (
    <section
      id="features"
      aria-label="Shadmin Essential Features"
      className="relative py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="mb-16 flex flex-col items-center gap-4 text-center">
          <Eyebrow>All the Essentials</Eyebrow>
          <h2 className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Beyond <GradientText>UI Elements</GradientText>
          </h2>
          <p className="mx-auto max-w-prose text-xl text-muted-foreground">
            With Shadmin, all the essential features come preconfigured with
            proven best practices. Spend less time on repetitive setup and more
            on what makes your app unique: your business logic.
          </p>
        </Reveal>

        <Reveal
          stagger
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[13rem] md:grid-flow-dense md:grid-cols-3"
        >
          {features.map((feature) => {
            const Visual = VISUALS[feature.name];
            const big = isBig(feature.span);
            return (
              <RevealItem
                key={feature.name}
                className={cn("h-full", spanClasses(feature.span))}
              >
                <GlassPanel
                  bezel={big}
                  className="group flex h-full flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-aurora">
                      <feature.icon
                        aria-hidden="true"
                        className={cn("text-white", big ? "size-6" : "size-5")}
                      />
                    </span>
                    <h3
                      className={cn(
                        "font-heading font-bold tracking-tight text-foreground",
                        big ? "text-xl" : "text-base",
                      )}
                    >
                      {feature.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  {Visual && (
                    <div className="mt-4 min-h-0 flex-1">
                      <Visual />
                    </div>
                  )}
                </GlassPanel>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
