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
      "dialog",
      "drawer",
      "dropdown-menu",
      "field",
      "input",
      "kbd",
      "label",
      "pagination",
      "popover",
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
      "tooltip",
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
    sourceDirs: [{ path: "src/components/admin", recursive: false }],
    extraFiles: [
      { path: "rules/AGENTS.md", type: "registry:file", target: "~/AGENTS.md" },
      { path: "src/components/ui/slot.tsx", type: "registry:ui" },
      { path: "src/hooks/use-theme.ts", type: "registry:component" },
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
    description:
      "Optional rich text input for Shadmin. Includes the full Minimal TipTap block.",
    registryDependencies: [
      "@shadmin/admin",
      "button",
      "dialog",
      "dropdown-menu",
      "input",
      "label",
      "popover",
      "separator",
      "sonner",
      "switch",
      "toggle",
      "toggle-group",
      "tooltip",
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
    description:
      "Optional block-based document editor (BlockEditorInput) and read-only renderer (BlockDocField) for Shadmin, powered by TipTap. Stores documents as TipTap JSON and ships an open `defineBlock` API with callout and reference-record blocks.",
    registryDependencies: [
      "@shadmin/admin",
      "button",
      "card",
      "command",
      "input",
      "label",
      "popover",
      "select",
      "skeleton",
      "switch",
      "tooltip",
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
    registryDependencies: ["@shadmin/admin"],
    dependencies: [],
    extraFiles: [
      { path: "src/examples/example-admin.tsx", type: "registry:component" },
    ],
  },
];

/**
 * Standalone `registry:theme` items. Each is generated by parsing its scoped
 * `.theme-<selector>` / `.theme-<selector>.dark` blocks out of `cssFile`.
 * `aurora: true` additionally folds in the shared aurora additive layer
 * (gradient + glass vars from src/styles/aurora.css, plus AURORA_UTILITIES_CSS).
 */
export const themes = [
  {
    name: "theme-aurora",
    selector: "aurora",
    title: "Aurora Theme",
    description:
      "Shadmin's signature aurora palette plus the aurora gradient and liquid-glass utilities (glass, bezel, text-aurora, bg-aurora).",
    cssFile: "src/styles/themes/aurora.css",
    aurora: true,
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
 * Hand-authored `css` payload for the aurora theme — the @utility rules from
 * src/styles/aurora.css, expressed in the registry's nested-object form.
 * Verified (shadcn@3.8.5) that the CLI appends these to the consumer's CSS so
 * Tailwind v4 generates the real .glass/.bezel/.text-aurora/.bg-aurora classes.
 */
export const AURORA_UTILITIES_CSS = {
  "@utility glass": {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    "-webkit-backdrop-filter": "blur(var(--glass-blur))",
    "backdrop-filter": "blur(var(--glass-blur))",
    "box-shadow": "var(--glass-shadow), var(--glass-inset)",
  },
  "@utility bezel": {
    "border-radius": "2rem",
    padding: "0.5rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    "-webkit-backdrop-filter": "blur(var(--glass-blur))",
    "backdrop-filter": "blur(var(--glass-blur))",
  },
  "@utility text-aurora": {
    background: "var(--aurora)",
    "-webkit-background-clip": "text",
    "background-clip": "text",
    color: "transparent",
  },
  "@utility bg-aurora": {
    background: "var(--aurora)",
  },
};
