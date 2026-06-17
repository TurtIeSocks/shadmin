// Single source of truth for registry.json block metadata.
// File lists are auto-generated from `sourceDirs`; deps and registry deps stay manual.
//
// Add a new component: drop it into one of the watched directories.
// Add a new block: append an entry here and run `pnpm registry:generate`.

export const registryMetadata = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "Shadmin",
  homepage: "https://shadmin.turtlesocks.dev/",
};

// Attribution stamped onto every emitted item (shadcn registry-item `author`).
export const AUTHOR = "Shadmin <https://shadmin.turtlesocks.dev>";

// Granular components/libs/hooks are auto-derived, so their `categories` are
// derived too: a "shadmin" umbrella (groups the whole kit in a multi-registry
// browse) plus one facet inferred from the item name/type. Blocks and themes
// carry hand-authored `categories` on their config entries instead.
const AUTH_NAMES = new Set([
  "access-denied",
  "auth-callback",
  "auth-error",
  "auth-layout",
  "authentication-error",
  "login-form",
  "login-page",
  "login-with-email",
]);
const LAYOUT_NAMES = new Set([
  "app-bar",
  "app-sidebar",
  "breadcrumb",
  "layout",
  "menu",
  "user-menu",
  "top-toolbar",
  "theme-mode-toggle",
  "theme-provider",
]);

export const categoriesForGranular = (name, type) => {
  if (type === "registry:lib") return ["shadmin", "library"];
  if (type === "registry:hook") return ["shadmin", "hooks"];
  if (type === "registry:ui") return ["shadmin", "ui"];
  let facet = "components";
  if (name.endsWith("-input")) facet = "inputs";
  else if (name.endsWith("-field")) facet = "fields";
  else if (name.endsWith("-button")) facet = "buttons";
  else if (AUTH_NAMES.has(name)) facet = "authentication";
  else if (LAYOUT_NAMES.has(name)) facet = "layout";
  return ["shadmin", facet];
};

/**
 * Each block entry describes how to assemble one `items[]` element in registry.json.
 *
 * - sourceDirs: directories whose .ts/.tsx files (minus tests/stories/screenshots) are
 *   included as registry files. `recursive: true` walks subdirectories.
 * - extraFiles: additional files (libs, hooks, rules, css) that don't live in a sourceDir.
 * - cssExtensions: include .css alongside .ts/.tsx (used by rich-text-input).
 */
export const blocks = [
  {
    name: "admin",
    type: "registry:block",
    title: "Shadmin Main Block",
    categories: ["shadmin", "dashboard"],
    description:
      "The Admin component, along with all the necessary components to create an admin (such as List, Edit, DataTable, TextField, TextInput, etc.)",
    // Auto-emit one granular registry item per file in this block alongside
    // the monolith. Lets consumers install single components (e.g.
    // `shadcn add @shadmin/data-table`) instead of the full block.
    granularize: true,
    cssVarsFromFile: "src/index.css",
    registryDependencies: [
      "accordion",
      "alert",
      "avatar",
      "badge",
      "breadcrumb",
      "button",
      "card",
      "checkbox",
      "collapsible",
      "command",
      "drawer",
      "dropdown-menu",
      "field",
      "input",
      "kbd",
      "label",
      "pagination",
      "radio-group",
      "select",
      "separator",
      "sheet",
      "sidebar",
      "skeleton",
      "sonner",
      "switch",
      "table",
      "tabs",
      "textarea",
    ],
    dependencies: [
      "@tanstack/react-query",
      "class-variance-authority",
      "clsx",
      "date-fns",
      "diacritic",
      "dompurify",
      "html-react-parser",
      "inflection",
      "lodash",
      "lucide-react",
      "query-string",
      "ra-core",
      "ra-i18n-polyglot",
      "ra-language-english",
      "react-dropzone",
      "react-hook-form",
      "react-router",
      "recharts",
      "tailwind-merge",
      "tw-animate-css",
    ],
    sourceDirs: [{ path: "src/components/admin", recursive: true }],
    extraFiles: [
      { path: "rules/AGENTS.md", type: "registry:file", target: "~/AGENTS.md" },
      { path: "src/components/ui/slot.tsx", type: "registry:ui" },
      { path: "src/components/ui/popover.tsx", type: "registry:ui" },
      { path: "src/components/ui/dialog.tsx", type: "registry:ui" },
      { path: "src/components/ui/tooltip.tsx", type: "registry:ui" },
      { path: "src/hooks/use-theme.ts", type: "registry:component" },
      { path: "src/lib/any.ts", type: "registry:lib" },
      { path: "src/lib/are-ids-equal.ts", type: "registry:lib" },
      { path: "src/lib/field-types.ts", type: "registry:lib" },
      { path: "src/lib/i18n-provider.ts", type: "registry:lib" },
      { path: "src/lib/notify-auth-error.ts", type: "registry:lib" },
      { path: "src/lib/resolve-label.ts", type: "registry:lib" },
      { path: "src/lib/sanitize-input-rest-props.ts", type: "registry:lib" },
      { path: "src/lib/title-portal-id.ts", type: "registry:lib" },
      { path: "src/lib/unknown-types.ts", type: "registry:lib" },
      { path: "src/lib/utils.ts", type: "registry:lib" },
      { path: "src/lib/theme-context.ts", type: "registry:lib" },
    ],
  },
  {
    name: "rich-text-input",
    type: "registry:block",
    title: "RichTextInput",
    categories: ["shadmin", "inputs", "editor"],
    description:
      "Optional rich text input for Shadmin. Includes the full Minimal TipTap block.",
    registryDependencies: [
      "@shadmin/admin",
      "button",
      "dropdown-menu",
      "input",
      "label",
      "separator",
      "sonner",
      "switch",
      "toggle",
      "toggle-group",
    ],
    dependencies: [
      "@tiptap/extension-code-block-lowlight",
      "@tiptap/extension-color",
      "@tiptap/extension-horizontal-rule",
      "@tiptap/extension-image",
      "@tiptap/extension-text-style",
      "@tiptap/extension-typography",
      "@tiptap/extensions",
      "@tiptap/pm",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "lowlight",
      "react-medium-image-zoom",
    ],
    sourceDirs: [
      {
        path: "src/components/rich-text-input",
        recursive: true,
        cssExtensions: true,
      },
    ],
  },
  {
    name: "block-editor",
    type: "registry:block",
    title: "BlockEditor",
    categories: ["shadmin", "editor"],
    description:
      "Optional block-based document editor (BlockEditorInput) and read-only renderer (BlockDocField) for Shadmin, powered by TipTap. Stores documents as TipTap JSON and ships an open `defineBlock` API with callout and reference-record blocks.",
    registryDependencies: [
      "@shadmin/admin",
      "button",
      "card",
      "command",
      "input",
      "label",
      "select",
      "skeleton",
      "switch",
    ],
    dependencies: [
      "@tiptap/core",
      "@tiptap/extension-drag-handle-react",
      "@tiptap/extensions",
      "@tiptap/pm",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/suggestion",
      "ra-core",
      "recharts",
      "zod",
    ],
    sourceDirs: [{ path: "src/components/block-editor", recursive: true }],
  },
  {
    name: "mdx-editor",
    type: "registry:block",
    title: "MdxEditor",
    categories: ["shadmin", "inputs", "editor"],
    description:
      "Optional markdown editor (MdxInput) and read-only renderer (MdxField) for Shadmin, powered by MDXEditor.",
    registryDependencies: ["@shadmin/admin"],
    dependencies: ["@mdxeditor/editor"],
    sourceDirs: [{ path: "src/components/mdx-editor", recursive: false }],
  },
  {
    name: "leaflet-admin",
    type: "registry:block",
    title: "LeafletAdmin",
    categories: ["shadmin", "maps"],
    docs: 'Import Leaflet\'s stylesheet once in your app entry: `import "leaflet/dist/leaflet.css";`. Map components are client-only — disable SSR on routes that use them. Drawing/editing uses Geoman via `react-leaflet-geoman-v2`. Full docs: https://shadmin.turtlesocks.dev/docs/leaflet-admin',
    description:
      "Optional Leaflet-based map fields, form inputs, drawing/editing primitives, OSM utilities, and geocoding for Shadmin.",
    registryDependencies: [
      "@shadmin/admin",
      "slider",
      "toggle",
      "toggle-group",
    ],
    dependencies: [
      "leaflet",
      "react-leaflet",
      "@geoman-io/leaflet-geoman-free",
      "react-leaflet-geoman-v2",
      "@turf/area",
      "@turf/bbox",
      "@turf/buffer",
      "@turf/difference",
      "@turf/simplify",
      "@turf/union",
      "@turf/helpers",
      "osmtogeojson",
    ],
    devDependencies: ["@types/leaflet"],
    sourceDirs: [{ path: "src/components/leaflet", recursive: true }],
  },
  {
    name: "csv-import",
    type: "registry:block",
    title: "CsvImport",
    categories: ["shadmin", "data-import"],
    docs: "Place `<CsvImport>` in a List's `actions` and pass a zod `schema`. Rows validate against the schema and batch through `dataProvider.createMany` (with a `create` fallback). Full docs: https://shadmin.turtlesocks.dev/docs/csv-import",
    description:
      "Optional CSV import wizard (Upload → Map → Preview → Commit) for Shadmin. Validates rows against a zod schema and batches inserts via the data provider.",
    registryDependencies: ["@shadmin/admin", "button", "progress"],
    dependencies: ["papaparse", "zod"],
    devDependencies: ["@types/papaparse"],
    sourceDirs: [{ path: "src/components/csv-import", recursive: false }],
  },
  {
    name: "extras",
    type: "registry:block",
    title: "Shadmin Extras",
    categories: ["shadmin"],
    description:
      "Optional higher-level admin components (kanban, command menu, calendar, scheduling, presence, approvals, cron/duration/phone/color/rating inputs, theme studio, etc.) for Shadmin.",
    registryDependencies: ["@shadmin/admin", "alert-dialog", "progress"],
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "cronstrue",
      "libphonenumber-js",
    ],
    sourceDirs: [
      { path: "src/components/extras", recursive: false },
      { path: "src/components/ui/color-picker", recursive: false },
    ],
  },
  {
    name: "monaco",
    type: "registry:block",
    title: "Monaco JSON Field & Input",
    categories: ["shadmin", "inputs", "editor"],
    docs: "Monaco loads its editor workers at runtime — works out of the box with Vite via `@monaco-editor/react`; other bundlers may need Monaco worker config. Prefer the `*Lazy` variants to code-split the editor out of your main bundle. Full docs: https://shadmin.turtlesocks.dev/docs/monaco-json-input",
    description:
      "Optional Monaco-powered JSON field and input components (with lazy variants) for Shadmin.",
    registryDependencies: ["@shadmin/admin"],
    dependencies: ["@monaco-editor/react", "monaco-editor"],
    sourceDirs: [{ path: "src/components/monaco", recursive: true }],
  },
  {
    name: "supabase",
    type: "registry:block",
    title: "Supabase Admin",
    categories: ["shadmin", "authentication", "data-providers"],
    docs: "Pass a Supabase data + auth provider to `<Admin>` and set your Supabase URL/key. Auth pages and CRUD guessers read your Supabase schema. Setup guide: https://shadmin.turtlesocks.dev/docs/supabase/getting-started",
    description:
      "Optional Supabase integration for Shadmin: auth pages (login, forgot/set password, social auth) and CRUD guessers driven by the Supabase schema.",
    registryDependencies: ["@shadmin/admin"],
    dependencies: [
      "@supabase/supabase-js",
      "openapi-types",
      "ra-supabase-core",
    ],
    sourceDirs: [
      {
        path: "src/components/supabase",
        recursive: true,
        excludeDirs: ["__fixtures__"],
      },
    ],
  },
  {
    name: "realtime",
    type: "registry:block",
    title: "Shadmin Realtime",
    categories: ["shadmin", "data-providers"],
    description:
      "WebSocket/SSE/BroadcastChannel realtime extension for the dataProvider — live List/Edit/Show views, menu badges, record locks.",
    registryDependencies: ["admin"],
    dependencies: ["ra-core", "@tanstack/react-query", "react", "react-router"],
    devDependencies: ["mock-socket"],
    sourceDirs: [{ path: "src/components/realtime", recursive: true }],
  },
  {
    name: "example-admin",
    type: "registry:block",
    title: "Example Admin built with Shadmin",
    categories: ["shadmin", "example"],
    registryDependencies: ["@shadmin/admin"],
    dependencies: [],
    extraFiles: [
      { path: "src/examples/example-admin.tsx", type: "registry:component" },
    ],
  },
  // Opt-in liquid-glass style. A `registry:style` that ships the material
  // (glass.css), the SVG filter component, and the pointer hook. Modeled as a
  // block here purely to reuse buildBlock's `extraFiles` machinery.
  {
    name: "style-glass",
    type: "registry:style",
    title: "Liquid Glass",
    categories: ["shadmin", "style"],
    docs: 'Opt-in liquid-glass material. Import the stylesheet once in your app entry (e.g. `import "@/styles/glass.css"`), then either add the `glass` / `glass--l2` / `glass--l3` classes to any element, or set `data-glass` on your `<html>` element to skin cards, dialogs, popovers, menus, sheets, and the sidebar (root it on `<html>` so portaled overlays are covered too). Only the `glass--l3` refraction level needs the SVG filter — render one `<GlassFilter />` near your root if you use it. Pair `glass--interactive` with `useGlassPointer` for cursor-tracking specular. Full docs: https://shadmin.turtlesocks.dev/docs/glass',
    description:
      "Opt-in liquid-glass material for Shadmin: a layered, fallback-first backdrop-blur surface (with optional SVG refraction and pointer-tracking specular) plus a data-attribute skin for the highlight surfaces (cards, dialogs, popovers, menus, sheets, sidebar).",
    extraFiles: [
      {
        path: "src/styles/glass.css",
        type: "registry:file",
        target: "~/src/styles/glass.css",
      },
      { path: "src/components/ui/glass-filter.tsx", type: "registry:ui" },
      { path: "src/hooks/use-glass-pointer.ts", type: "registry:hook" },
    ],
  },
];

/**
 * Standalone `registry:theme` items. Each is generated by parsing its scoped
 * `.theme-<selector>` / `.theme-<selector>.dark` blocks out of `cssFile`.
 */
export const themes = [
  {
    name: "theme-aurora",
    selector: "aurora",
    title: "Aurora Theme",
    description: "Shadmin's signature aurora palette.",
    cssFile: "src/styles/themes/aurora.css",
  },
  {
    name: "theme-bw",
    selector: "bw",
    title: "Black & White Theme",
    description: "High-contrast monochrome palette for Shadmin.",
    cssFile: "src/styles/themes/bw.css",
  },
  {
    name: "theme-house",
    selector: "house",
    title: "House Theme",
    description: "Warm 'house' palette for Shadmin.",
    cssFile: "src/styles/themes/house.css",
  },
  {
    name: "theme-nano",
    selector: "nano",
    title: "Nano Theme",
    description: "Compact, low-radius 'nano' palette for Shadmin.",
    cssFile: "src/styles/themes/nano.css",
  },
  {
    name: "theme-radiant",
    selector: "radiant",
    title: "Radiant Theme",
    description: "Vivid 'radiant' palette for Shadmin.",
    cssFile: "src/styles/themes/radiant.css",
  },
];

/**
 * `registry:base` items — shadcn 4.x base layers that carry a `config` block
 * (components.json defaults: style, tailwind, iconLibrary, aliases) alongside
 * the root `cssVars`. Installing one sets up a project's defaults before adding
 * components. `style-shadmin` is the vanilla shadcn look (New York, neutral,
 * Lucide) — Shadmin's default foundation. The `config` is derived from our own
 * components.json at generate time (see `buildStyle` in generate-registry.mjs).
 */
export const baseStyles = [
  {
    name: "style-shadmin",
    title: "Shadmin",
    description:
      "Shadmin's base configuration: the vanilla shadcn New York style with the neutral base color, Lucide icons, and CSS-variable theming. Install first to set sensible components.json defaults, then add Shadmin components.",
    cssVarsFromFile: "src/index.css",
  },
];
