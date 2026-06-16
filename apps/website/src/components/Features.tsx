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

// Hand-placed Tetris bento. Each card is explicitly positioned on a 3-col grid
// (9 rows = 27 cells) so big pieces zig-zag through every column — no column is
// ever made up entirely of 1×1 cards. Sizes: hero 2×2, tall 1×2, wide 2×1, single 1×1.
//   2 hero(8) + 1 tall(2) + 4 wide(8) + 9 single(9) = 27 = 9 rows × 3 cols.
// Placement classes are md-only; below md the cards stack/flow normally.
type Size = "hero" | "tall" | "wide" | "single";

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  size: Size;
  col: 1 | 2 | 3;
  row: number;
}

const features: Feature[] = [
  {
    name: "Data Maps",
    description: "Interactive Leaflet maps with geospatial data layers",
    icon: MapPin,
    size: "hero",
    col: 1,
    row: 1,
  },
  {
    name: "Data Fetching",
    description: "Efficient hooks for robust API interactions",
    icon: ArrowDownUp,
    size: "single",
    col: 3,
    row: 1,
  },
  {
    name: "Lists & Data Tables",
    description: "Flexible lists & tables for displaying data collections",
    icon: AlignJustify,
    size: "tall",
    col: 3,
    row: 2,
  },
  {
    name: "Command Menu",
    description: "A ⌘K command palette for instant keyboard-driven navigation",
    icon: Command,
    size: "wide",
    col: 1,
    row: 3,
  },
  {
    name: "Authentication",
    description: "Secure auth flows and user management",
    icon: KeyRound,
    size: "single",
    col: 1,
    row: 4,
  },
  {
    name: "AI-Ready",
    description:
      "Ships with an MCP server — scaffold and edit admin UIs with AI",
    icon: Sparkles,
    size: "hero",
    col: 2,
    row: 4,
  },
  {
    name: "Search & Filtering",
    description: "Search-as-you-type and combined filters",
    icon: ScanSearch,
    size: "single",
    col: 1,
    row: 5,
  },
  {
    name: "Flexible Theming",
    description: "Theme presets, light/dark mode & granular styling",
    icon: Palette,
    size: "wide",
    col: 1,
    row: 6,
  },
  {
    name: "I18n",
    description: "Internationalization for global applications",
    icon: Earth,
    size: "single",
    col: 3,
    row: 6,
  },
  {
    name: "Realtime",
    description: "Live updates with any realtime backend",
    icon: RadioTower,
    size: "single",
    col: 1,
    row: 7,
  },
  {
    name: "Forms & Validation",
    description: "Data-bound inputs, adaptable layouts, dynamic fields",
    icon: NotepadText,
    size: "wide",
    col: 2,
    row: 7,
  },
  {
    name: "Roles & Permissions",
    description: "Fine-grained RBAC, per-resource and per-action",
    icon: ShieldCheck,
    size: "wide",
    col: 1,
    row: 8,
  },
  {
    name: "CSV Import / Export",
    description: "Bulk data import and export with spreadsheet support",
    icon: FileSpreadsheet,
    size: "single",
    col: 3,
    row: 8,
  },
  {
    name: "Rich Text Editor",
    description: "WYSIWYG editing with full formatting and media",
    icon: Pilcrow,
    size: "single",
    col: 1,
    row: 9,
  },
  {
    name: "Kanban & Scheduling",
    description: "Drag-and-drop boards and calendar views",
    icon: CalendarDays,
    size: "single",
    col: 2,
    row: 9,
  },
  {
    name: "Resilient UI",
    description: "Gracefully manages loading, empty, and error states",
    icon: BugOff,
    size: "single",
    col: 3,
    row: 9,
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

function FormVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="h-2 w-14 shrink-0 rounded bg-foreground/15" />
          <span className="h-6 flex-1 rounded-md border border-border bg-background/60" />
        </div>
      ))}
      <div className="flex justify-end">
        <span className="h-6 w-16 rounded-md bg-aurora" />
      </div>
    </div>
  );
}

function RolesVisual() {
  const roles = ["Admin", "Editor", "Viewer"];
  const grants = [
    [true, true, true],
    [true, true, false],
    [true, false, false],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {roles.map((role, i) => (
        <div key={role} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-[11px] text-muted-foreground">
            {role}
          </span>
          <div className="flex gap-1.5">
            {grants[i].map((on, j) => (
              <span
                key={j}
                className={cn(
                  "size-3.5 rounded",
                  on ? "bg-aurora" : "bg-foreground/10",
                )}
              />
            ))}
          </div>
        </div>
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
  "Forms & Validation": FormVisual,
  "Roles & Permissions": RolesVisual,
};

// Literal class maps — Tailwind can't see interpolated `md:col-start-${n}`.
const COL_START: Record<number, string> = {
  1: "md:col-start-1",
  2: "md:col-start-2",
  3: "md:col-start-3",
};
const ROW_START: Record<number, string> = {
  1: "md:row-start-[1]",
  2: "md:row-start-[2]",
  3: "md:row-start-[3]",
  4: "md:row-start-[4]",
  5: "md:row-start-[5]",
  6: "md:row-start-[6]",
  7: "md:row-start-[7]",
  8: "md:row-start-[8]",
  9: "md:row-start-[9]",
};

function sizeClasses(size: Size) {
  if (size === "hero") return "md:col-span-2 md:row-span-2";
  if (size === "tall") return "md:row-span-2";
  if (size === "wide") return "md:col-span-2";
  return "";
}

const isBig = (size: Size) => size === "hero" || size === "tall";

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
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[13rem] md:grid-cols-3"
        >
          {features.map((feature) => {
            const Visual = VISUALS[feature.name];
            const big = isBig(feature.size);
            return (
              <RevealItem
                key={feature.name}
                className={cn(
                  "h-full",
                  COL_START[feature.col],
                  ROW_START[feature.row],
                  sizeClasses(feature.size),
                )}
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
