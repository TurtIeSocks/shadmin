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
} from "lucide-react";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";
import { cn } from "@/lib/utils";

// span: undefined = 1×1, "wide" = col-span-2, "tall" = row-span-2, "hero" = col-span-2 row-span-2
type Span = "wide" | "tall" | "hero" | undefined;

const features: {
  name: string;
  description: string;
  icon: React.ElementType;
  span: Span;
}[] = [
  {
    name: "Data Maps",
    description: "Interactive Leaflet maps with geospatial data layers",
    icon: MapPin,
    span: "hero",
  },
  {
    name: "Lists & Data Tables",
    description: "Flexible list components for displaying data collections",
    icon: AlignJustify,
    span: "wide",
  },
  {
    name: "Forms & Validation",
    description:
      "Data-bound inputs, adaptable layouts, and dynamic field support",
    icon: NotepadText,
    span: "tall",
  },
  {
    name: "Data Fetching",
    description: "Efficient hooks for robust API interactions",
    icon: ArrowDownUp,
    span: undefined,
  },
  {
    name: "Authentication",
    description: "Secure authentication flows and user management",
    icon: KeyRound,
    span: undefined,
  },
  {
    name: "Command Menu",
    description: "⌘K command palette for instant keyboard-driven navigation",
    icon: Command,
    span: "wide",
  },
  {
    name: "Flexible Theming",
    description: "App themes, light/dark mode & granular component styling",
    icon: Palette,
    span: "tall",
  },
  {
    name: "Search & Filtering",
    description:
      "Components for search-as-you-type, combined filters, and more",
    icon: ScanSearch,
    span: undefined,
  },
  {
    name: "I18n",
    description: "Internationalization support for global applications",
    icon: Earth,
    span: undefined,
  },
  {
    name: "Realtime",
    description: "Live updates and reactive data with any realtime backend",
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
    description: "WYSIWYG editing with full formatting and media support",
    icon: Pilcrow,
    span: undefined,
  },
  {
    name: "Kanban & Scheduling",
    description: "Drag-and-drop boards and calendar views for task planning",
    icon: CalendarDays,
    span: undefined,
  },
  {
    name: "Roles & Permissions",
    description: "Fine-grained RBAC with per-resource and per-action controls",
    icon: ShieldCheck,
    span: undefined,
  },
  {
    name: "Resilient UI",
    description: "Gracefully manages loading, empty, and error states",
    icon: BugOff,
    span: undefined,
  },
];

// ── Mini-visuals ──────────────────────────────────────────────────────────────

function DataTableVisual() {
  const rows = [
    { width1: "w-20", width2: "w-14", color: "bg-emerald-500" },
    { width1: "w-16", width2: "w-20", color: "bg-amber-500" },
    { width1: "w-24", width2: "w-10", color: "bg-violet-500" },
  ];
  return (
    <div className="mt-4 flex flex-col gap-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-2"
        >
          <span className="size-5 shrink-0 rounded-full bg-foreground/10" />
          <span className={cn("h-2 rounded bg-foreground/15", row.width1)} />
          <span className={cn("h-2 rounded bg-foreground/15", row.width2)} />
          <span
            className={cn("ml-auto size-2 shrink-0 rounded-full", row.color)}
          />
        </div>
      ))}
    </div>
  );
}

function CommandMenuVisual() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background/60 px-3 py-2 flex items-center gap-2">
      <Search size={14} className="text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm text-muted-foreground">Search…</span>
      <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
        ⌘K
      </kbd>
    </div>
  );
}

function ThemingVisual() {
  const swatches = [
    { className: "bg-aurora" },
    { style: { backgroundColor: "#7f77dd" } },
    { style: { backgroundColor: "#d4537e" } },
    { style: { backgroundColor: "#1d9e75" } },
    { style: { backgroundColor: "#378add" } },
  ] as { className?: string; style?: React.CSSProperties }[];
  return (
    <div className="mt-4 flex gap-2">
      {swatches.map((s, i) => (
        <span
          key={i}
          className={cn("size-7 rounded-lg shrink-0", s.className)}
          style={s.style}
        />
      ))}
    </div>
  );
}

function MapVisual() {
  // dot grid 8×5 with 3 aurora "pins" scattered
  const pinCells = new Set([10, 18, 29]);
  const total = 8 * 5;
  return (
    <div className="mt-4 relative">
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-full",
              pinCells.has(i)
                ? "bg-aurora scale-150 shadow-[0_0_6px_2px_rgba(139,92,246,0.4)]"
                : "bg-foreground/10",
            )}
          />
        ))}
      </div>
      {/* overlay a small MapPin icon near center pin */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <MapPin
          size={14}
          className="absolute text-white drop-shadow"
          style={{ top: "calc(2 * (0.5rem + 0.375rem) - 7px)", left: "calc(2 * (0.5rem + 0.375rem) - 7px)" }}
        />
      </div>
    </div>
  );
}

// ── Span helpers ──────────────────────────────────────────────────────────────

function spanClasses(span: Span) {
  if (span === "hero") return "md:col-span-2 md:row-span-2";
  if (span === "wide") return "md:col-span-2";
  if (span === "tall") return "md:row-span-2";
  return "";
}

function isBig(span: Span): boolean {
  return span === "hero" || span === "wide" || span === "tall";
}

// ── Mini-visual resolver ──────────────────────────────────────────────────────

function MiniVisual({ name }: { name: string }) {
  if (name === "Lists & Data Tables") return <DataTableVisual />;
  if (name === "Command Menu") return <CommandMenuVisual />;
  if (name === "Flexible Theming") return <ThemingVisual />;
  if (name === "Data Maps") return <MapVisual />;
  return null;
}

// ── Section ───────────────────────────────────────────────────────────────────

export function Features() {
  return (
    <section
      id="features"
      aria-label="Shadmin Essential Features"
      className="relative py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-center gap-4 text-center mb-16">
          <Eyebrow>All the Essentials</Eyebrow>
          <h2 className="text-3xl font-black font-heading tracking-tight text-foreground sm:text-4xl">
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
          className="grid gap-4 grid-cols-1 md:grid-cols-3 md:auto-rows-[13rem] md:grid-flow-dense"
        >
          {features.map((feature) => (
            <RevealItem
              key={feature.name}
              className={cn("h-full", spanClasses(feature.span))}
            >
              <GlassPanel
                bezel={isBig(feature.span)}
                className="h-full p-5 transition duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex flex-col gap-3 flex-1">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-aurora">
                    <feature.icon
                      aria-hidden="true"
                      className={cn(
                        "text-white",
                        isBig(feature.span) ? "size-6" : "size-5",
                      )}
                    />
                  </span>
                  <h3
                    className={cn(
                      "font-bold font-heading tracking-tight text-foreground",
                      isBig(feature.span) ? "text-xl" : "text-base",
                    )}
                  >
                    {feature.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <MiniVisual name={feature.name} />
              </GlassPanel>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
