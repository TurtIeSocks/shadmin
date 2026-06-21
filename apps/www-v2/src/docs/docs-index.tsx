import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Boxes,
  Database,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Map,
  PanelsTopLeft,
  RadioTower,
  Rocket,
  Settings2,
  Sparkles,
  SquarePen,
  Table2,
  Type,
} from "lucide-react";
import { Link } from "react-router";
import { navTree } from "./nav-content";
import type { DocLeaf } from "./types";

// Per-section icon + one-line blurb (keyed by folder). Title + page count + the
// first-page href are derived from navTree.
const SECTION_META: Record<string, { icon: LucideIcon; blurb: string }> = {
  "getting-started": { icon: Rocket, blurb: "Install shadmin and scaffold your first admin in minutes." },
  "app-config": { icon: Settings2, blurb: "Wire up the Admin, resources, data providers, auth, and i18n." },
  "page-components": { icon: LayoutDashboard, blurb: "List, Create, Edit, and Show — the screens of every CRUD app." },
  "data-display": { icon: Table2, blurb: "Tables, fields, and read-only views for presenting records." },
  "data-edition": { icon: SquarePen, blurb: "Forms and inputs for creating and updating records." },
  leaflet: { icon: Map, blurb: "Interactive maps, markers, and geocoding with Leaflet." },
  extras: { icon: Sparkles, blurb: "Power-ups: schema-driven views, guessers, and more." },
  "csv-import": { icon: FileSpreadsheet, blurb: "Bulk-import records straight from CSV files." },
  "mdx-editor": { icon: FileText, blurb: "Author MDX content with a rich WYSIWYG editor." },
  "rich-text-input": { icon: Type, blurb: "A TipTap-based rich text input for your forms." },
  "block-editor": { icon: Blocks, blurb: "Notion-style block editing for structured content." },
  realtime: { icon: RadioTower, blurb: "Live updates, locks, and presence over your data provider." },
  "ui-layout": { icon: PanelsTopLeft, blurb: "App shell, sidebar, theming, and the shadcn primitives." },
  supabase: { icon: Database, blurb: "Drop-in Supabase auth and data-provider integration." },
  misc: { icon: Boxes, blurb: "Everything else — MCP, the changelog, and odds and ends." },
};

const ease = "cubic-bezier(0.32,0.72,0,1)";

export default function DocsIndex() {
  const sections = navTree
    .map((g) => {
      const leaves = g.children.filter((c): c is DocLeaf => c.kind === "leaf");
      return { dir: g.dir, title: g.title, count: leaves.length, first: leaves[0]?.slug };
    })
    .filter((s) => s.count > 0 && s.first);

  const componentsHref =
    sections.find((s) => s.dir === "page-components")?.first ?? sections[0]?.first;

  return (
    <div className="not-prose">
      {/* Hero */}
      <span className="inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Documentation
      </span>
      <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Build admin UIs, fast.
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
        shadcn-native components for lists, forms, auth, and more. Copy them in,
        own the code, ship the dashboard.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          to="/docs/getting-started/install"
          className="group inline-flex items-center gap-2.5 rounded-full bg-primary py-2.5 pl-5 pr-2.5 text-sm font-medium text-primary-foreground transition-transform duration-300 active:scale-[0.98]"
          style={{ transitionTimingFunction: ease }}
        >
          Get started
          <span
            className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ transitionTimingFunction: ease }}
          >
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </span>
        </Link>
        {componentsHref && (
          <Link
            to={`/docs/${componentsHref}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse components
          </Link>
        )}
      </div>

      {/* Section cards (double-bezel) */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {sections.map((s, i) => {
          const meta = SECTION_META[s.dir] ?? { icon: Boxes, blurb: "" };
          const Icon = meta.icon;
          return (
            <Link
              key={s.dir}
              to={`/docs/${s.first}`}
              className="group block rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60 transition-all duration-500 hover:-translate-y-0.5 hover:bg-muted hover:ring-border"
              style={{
                transitionTimingFunction: ease,
                animation: `docs-rise 0.55s ${ease} both`,
                animationDelay: `${i * 35}ms`,
              }}
            >
              <div className="h-full rounded-[0.85rem] border border-border/40 bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                    <Icon className="size-[1.15rem]" strokeWidth={1.5} />
                  </span>
                  <span className="font-semibold leading-tight text-foreground">
                    {s.title}
                  </span>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {s.count}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    strokeWidth={1.5}
                    style={{ transitionTimingFunction: ease }}
                  />
                </div>
                {meta.blurb && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {meta.blurb}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
