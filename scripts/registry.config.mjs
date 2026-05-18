// Single source of truth for registry.json block metadata.
// File lists are auto-generated from `sourceDirs`; deps and registry deps stay manual.
//
// Add a new component: drop it into one of the watched directories.
// Add a new block: append an entry here and run `pnpm registry:generate`.

export const registryMetadata = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "Shadcn Admin Kit",
  homepage: "https://marmelab.com/shadcn-admin-kit/",
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
    title: "Shadcn Admin Kit Main Block",
    description:
      "The Admin component, along with all the necessary components to create an admin (such as List, Edit, DataTable, TextField, TextInput, etc.)",
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
      { path: "src/hooks/use-form-field.ts", type: "registry:component" },
      { path: "src/hooks/use-theme.ts", type: "registry:component" },
      { path: "src/lib/are-ids-equal.ts", type: "registry:lib" },
      { path: "src/lib/field-types.ts", type: "registry:lib" },
      { path: "src/lib/i18n-provider.ts", type: "registry:lib" },
      { path: "src/lib/notify-auth-error.ts", type: "registry:lib" },
      { path: "src/lib/sanitize-input-rest-props.ts", type: "registry:lib" },
      { path: "src/lib/unknown-types.ts", type: "registry:lib" },
      { path: "src/lib/utils.ts", type: "registry:lib" },
    ],
  },
  {
    name: "rich-text-input",
    type: "registry:block",
    title: "RichTextInput",
    description:
      "Optional rich text input for Shadcn Admin Kit. Includes the full Minimal TipTap block.",
    registryDependencies: [
      "@shadcn-admin-kit/admin",
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
    name: "mdx-editor",
    type: "registry:block",
    title: "MdxEditor",
    description:
      "Optional markdown editor (MdxInput) and read-only renderer (MdxField) for Shadcn Admin Kit, powered by MDXEditor.",
    registryDependencies: ["@shadcn-admin-kit/admin"],
    dependencies: ["@mdxeditor/editor"],
    sourceDirs: [{ path: "src/components/mdx-editor", recursive: false }],
  },
  {
    name: "leaflet-admin",
    type: "registry:block",
    title: "LeafletAdmin",
    description:
      "Optional Leaflet-based map fields, form inputs, drawing/editing primitives, OSM utilities, and geocoding for Shadcn Admin Kit.",
    registryDependencies: [
      "@shadcn-admin-kit/admin",
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
      "Optional CSV import wizard (Upload → Map → Preview → Commit) for Shadcn Admin Kit. Validates rows against a zod schema and batches inserts via the data provider.",
    registryDependencies: ["@shadcn-admin-kit/admin", "button", "progress"],
    dependencies: ["papaparse", "zod"],
    devDependencies: ["@types/papaparse"],
    sourceDirs: [{ path: "src/components/csv-import", recursive: false }],
  },
  {
    name: "extras",
    type: "registry:block",
    title: "Shadcn Admin Kit Extras",
    description:
      "Optional higher-level admin components (kanban, command menu, calendar, scheduling, presence, approvals, cron/duration/phone/color/rating inputs, theme studio, etc.) for Shadcn Admin Kit.",
    registryDependencies: [
      "@shadcn-admin-kit/admin",
      "alert-dialog",
      "progress",
    ],
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
      "Optional Monaco-powered JSON field and input components (with lazy variants) for Shadcn Admin Kit.",
    registryDependencies: ["@shadcn-admin-kit/admin"],
    dependencies: ["@monaco-editor/react", "monaco-editor"],
    sourceDirs: [{ path: "src/components/monaco", recursive: true }],
  },
  {
    name: "supabase",
    type: "registry:block",
    title: "Supabase Admin",
    description:
      "Optional Supabase integration for Shadcn Admin Kit: auth pages (login, forgot/set password, social auth) and CRUD guessers driven by the Supabase schema.",
    registryDependencies: ["@shadcn-admin-kit/admin"],
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
    name: "example-admin",
    type: "registry:block",
    title: "Example Admin built with Shadcn Admin Kit",
    registryDependencies: ["@shadcn-admin-kit/admin"],
    dependencies: [],
    extraFiles: [
      { path: "src/examples/example-admin.tsx", type: "registry:component" },
    ],
  },
];
