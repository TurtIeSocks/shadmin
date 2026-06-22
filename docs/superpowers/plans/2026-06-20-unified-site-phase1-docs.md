# Unified Site — Phase 1 (Docs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a filesystem-driven docs site in `apps/www-v2` that consumes components from a built `shadmin` package (no dual copy), renders MDX with live component previews, and prerenders to static HTML — plus a thin top nav reaching Home/Docs/Demo.

**Architecture:** One Vite + React Router app. `packages/shadmin` gains a `tsc + tsc-alias` library build (resolves its registry-mandated `@/` imports at build time) so `www-v2` imports it cleanly and keeps its own `@/`. Docs nav is derived from the `content/` file tree via `import.meta.glob` + co-located `_meta.ts` ordering — no generated manifest, no `guides-nav.ts`. Static output via `vite-react-ssg`.

**Tech Stack:** pnpm workspaces + Turbo, Vite, React 19, React Router 7 (library mode), `vite-react-ssg`, `@mdx-js/rollup` + remark plugins, `react-shiki`, Tailwind v4, ra-core + ra-data-fakerest (for admin-block previews), `tsc-alias`.

## Global Constraints

- Package manager: **pnpm** (`pnpm@10.14.0-0`). Never use npm/yarn to install.
- React **19**, Tailwind **v4** (`@tailwindcss/vite`).
- shadmin source uses `@/*` → `./src/*` (shadcn registry constraint — do NOT change shadmin's source aliases). Resolve it via the build, not a consumer alias.
- www-v2 keeps `@/*` → `./src/*` (its OWN src). shadmin is imported via the `shadmin/...` specifier only.
- Components consumed from shadmin's **built `dist/`**, never raw src.
- Install commands are `@shadmin/<name>` form: `npx|pnpm dlx|yarn dlx|bunx shadcn@latest add @shadmin/<name>`.
- No Sandpack / editable playground.
- The standalone `apps/demo` is **reference only** in this phase — do not copy it in. Demo route is a stub.
- One MDX file in `content/` = one page; the file tree IS the sidebar.

---

## File Structure

**`packages/shadmin/` (build additions):**
- Modify `package.json` — add `exports`, `files`, `build` script, `tsc-alias` devDep
- Create `tsconfig.build.json` — emit config
- Create `scripts/copy-styles.mjs` — copy `.css` assets into `dist/`

**`apps/www-v2/` (the site):**
- Modify `package.json` — deps + scripts
- Modify `vite.config.ts` — MDX plugin, drop tsconfigPaths-only setup
- Modify `index.html` / `src/main.tsx` — `vite-react-ssg` entry
- Modify `src/index.css` (or main css) — Tailwind `@source` shadmin dist + import shadmin theme
- Delete `src/components/ui/**` (56 dup files) and stale `scripts/` references
- Create `src/routes.tsx` — route table + `includedRoutes` export
- Create `src/components/site-nav.tsx` — top nav
- Create `src/pages/home.tsx`, `src/pages/demo-stub.tsx` — placeholders
- Create `scripts/remark-*.mjs` (3, copied from website)
- Create `src/docs/` engine:
  - `types.ts` — `MetaEntry`, `DocLeaf`, `DocGroup`
  - `nav.ts` — glob discovery + tree builder (pure, unit-tested)
  - `registry.ts` — import `registry.json`, name set + install command builder (pure, unit-tested)
  - `docs-layout.tsx` — sidebar + `<Outlet>`
  - `mdx-page.tsx` — slug → MDX module renderer + install block
  - `component-preview.tsx` — `<ComponentPreview>`
  - `demo-kit/demo-admin.tsx`, `demo-kit/seed.ts` — admin preview wrapper
  - `mdx/mdx-components.tsx`, `mdx/code-block.tsx`, `mdx/callout.tsx`, `mdx/tabs.tsx`, `mdx/install-command.tsx` (ported, de-glassed)
  - `content/**` — migrated MDX + `_meta.ts` files + `demos/*.tsx`
- Create `src/docs/nav.test.ts`, `src/docs/registry.test.ts` — `node --test`

---

## Task 1: shadmin library build (`tsc` + `tsc-alias`)

Emit a `dist/` with `@/` rewritten to relative paths, exposed via an `exports` map, so consumers import `shadmin/components/ui/button` and never see `@/`.

**Files:**
- Create: `packages/shadmin/tsconfig.build.json`
- Create: `packages/shadmin/scripts/copy-styles.mjs`
- Modify: `packages/shadmin/package.json`

**Interfaces:**
- Produces: importable subpaths `shadmin/components/ui/<name>`, `shadmin/lib/utils`, `shadmin/hooks/<name>`, `shadmin/styles/<file>.css`; build artifact at `packages/shadmin/dist/**`.

- [ ] **Step 1: Add devDep + scripts + exports to `package.json`**

Add to `devDependencies`:
```json
"tsc-alias": "^1.8.10"
```
Add to `scripts` (keep existing):
```json
"build": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json && node scripts/copy-styles.mjs"
```
Add top-level fields (keep `private: true`):
```json
"files": ["dist"],
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
  "./components/*": { "types": "./dist/components/*.d.ts", "import": "./dist/components/*.js" },
  "./hooks/*": { "types": "./dist/hooks/*.d.ts", "import": "./dist/hooks/*.js" },
  "./lib/*": { "types": "./dist/lib/*.d.ts", "import": "./dist/lib/*.js" },
  "./styles/*": "./dist/styles/*"
}
```

- [ ] **Step 2: Create `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": [
    "src/**/*.stories.tsx",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/test/**",
    "src/examples/**",
    "src/**/*-env.d.ts"
  ]
}
```

- [ ] **Step 3: Create `scripts/copy-styles.mjs`**

```js
// Copy every .css under src/ into dist/, preserving structure.
// tsc only emits .js/.d.ts; component + theme CSS must be copied verbatim.
import { cp, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const SRC = new URL("../src/", import.meta.url);
const DIST = new URL("../dist/", import.meta.url);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) await walk(rel);
    else if (extname(e.name) === ".css") {
      const from = new URL(rel + (e.isDirectory() ? "/" : ""), SRC);
      const to = new URL(rel, DIST);
      await cp(from, to);
    }
  }
}
await walk("");
console.log("copied .css assets to dist/");
```

- [ ] **Step 4: Install + build**

Run: `pnpm install`
Then: `pnpm --filter shadmin build`
Expected: completes; `packages/shadmin/dist/components/ui/button.js` exists.

- [ ] **Step 5: Verify `@/` is resolved (no leakage)**

Run: `grep -rl "@/" packages/shadmin/dist/components/ui/ || echo CLEAN`
Expected: `CLEAN` (tsc-alias rewrote all `@/` to relative paths).

Run: `node -e "import('shadmin/components/ui/button').then(m=>console.log(typeof m.Button))"` from `packages/shadmin`
Expected: prints `function` (or `object`) — the export resolves.

> If emit fails on a heavy component (leaflet/mdx-editor/monaco) that Phase 1 doesn't use, do NOT special-case it here — those modules still emit as plain JS with their import statements intact; they only fail at runtime if a consumer imports them, which Phase 1 does not. A genuine emit *type* error must be fixed in shadmin source (the typecheck already passes with `noEmit`, so emit errors are unexpected — investigate, don't suppress).

- [ ] **Step 6: Wire Turbo build output**

Confirm `turbo.json`'s `build` task lists `"dist/**"` in `outputs` (it does). No change needed unless absent. The `dependsOn: ["^build"]` edge means any app depending on `shadmin` builds it first automatically.

- [ ] **Step 7: Commit**

```bash
git add packages/shadmin/package.json packages/shadmin/tsconfig.build.json packages/shadmin/scripts/copy-styles.mjs pnpm-lock.yaml
git commit -m "feat(shadmin): add tsc+tsc-alias library build with exports map"
```

---

## Task 2: www-v2 consumes shadmin; delete the dual `ui/` copy

**Files:**
- Modify: `apps/www-v2/package.json`
- Modify: `apps/www-v2/src/index.css` (the Tailwind entry — confirm exact filename)
- Delete: `apps/www-v2/src/components/ui/**` (56 files)

**Interfaces:**
- Consumes: `shadmin/components/ui/*`, `shadmin/lib/utils` (Task 1).
- Produces: a www-v2 that renders shadmin primitives; `cn` available via `shadmin/lib/utils`.

- [ ] **Step 1: Add the workspace dep**

In `apps/www-v2/package.json` add to `dependencies`:
```json
"shadmin": "workspace:*"
```
Run: `pnpm install`

- [ ] **Step 2: Point Tailwind at shadmin's dist**

In `apps/www-v2/src/index.css` (Tailwind entry), after `@import "tailwindcss";`, add:
```css
@source "../node_modules/shadmin/dist";
```
(Tailwind v4 scans the built JS class strings so shadmin's utilities are generated in www-v2's CSS.)

- [ ] **Step 3: Delete the duplicate primitives**

Run: `git rm -r apps/www-v2/src/components/ui`
Expected: 56 files removed.

- [ ] **Step 4: Add a smoke test (TDD) for consumption**

Create `apps/www-v2/src/lib/shadmin-smoke.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";

test("shadmin Button export resolves from built package", async () => {
  const mod = await import("shadmin/components/ui/button");
  assert.ok(mod.Button, "Button export should exist");
});
```

- [ ] **Step 5: Run it — expect PASS (shadmin already built in Task 1)**

Run: `pnpm --filter shadmin build && node --test apps/www-v2/src/lib/shadmin-smoke.test.ts`
Expected: PASS. (If `ERR_MODULE_NOT_FOUND`, the exports map or dist is wrong — fix Task 1.)

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter www-v2 typecheck`
Expected: no errors referencing the deleted `@/components/ui/*` (nothing imported them yet — app.tsx is an empty div).

- [ ] **Step 7: Commit**

```bash
git add apps/www-v2/package.json apps/www-v2/src/index.css apps/www-v2/src/lib/shadmin-smoke.test.ts pnpm-lock.yaml
git commit -m "feat(www-v2): consume shadmin built package, remove dual ui/ copy"
```

---

## Task 3: vite-react-ssg entry + route skeleton + top nav

Replace the `<BrowserRouter>` skeleton with a `vite-react-ssg` route table, add the Home/Docs/Demo nav, and stub Home + Demo.

**Files:**
- Modify: `apps/www-v2/package.json` (deps + scripts)
- Modify: `apps/www-v2/index.html` (entry already `/src/main.tsx`)
- Rewrite: `apps/www-v2/src/main.tsx`
- Create: `apps/www-v2/src/routes.tsx`
- Create: `apps/www-v2/src/components/site-nav.tsx`
- Create: `apps/www-v2/src/pages/home.tsx`, `apps/www-v2/src/pages/demo-stub.tsx`
- Create/rewrite: `apps/www-v2/src/app.tsx` (root layout)

**Interfaces:**
- Produces: `routes` array + `includedRoutes` (extended in Task 6); `<SiteNav>`.

- [ ] **Step 1: Install vite-react-ssg**

Run: `pnpm --filter www-v2 add vite-react-ssg`

- [ ] **Step 2: Replace dev/build/preview scripts**

In `apps/www-v2/package.json` `scripts`, set:
```json
"dev": "vite-react-ssg dev --port 5274",
"build": "vite-react-ssg build",
"preview": "vite preview --port 4273"
```
Remove the stale `"docs:manifest"` and `"docs:check"` entries (they point at non-existent scripts copied from website).

- [ ] **Step 3: Root layout `app.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import { SiteNav } from "@/components/site-nav";

export function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteNav />
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 4: Top nav**

`src/components/site-nav.tsx`:
```tsx
import { NavLink } from "react-router-dom";
import { cn } from "shadmin/lib/utils";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/docs", label: "Docs" },
  { to: "/demo", label: "Demo" },
];

export function SiteNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <span className="font-semibold">shadmin</span>
        <ul className="flex items-center gap-4">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "text-sm text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground font-medium",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 5: Stub pages**

`src/pages/home.tsx`:
```tsx
export function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">shadmin</h1>
      <p className="mt-4 text-muted-foreground">
        shadcn-native admin kit. Landing content lands in Phase 2.
      </p>
    </main>
  );
}
```
`src/pages/demo-stub.tsx`:
```tsx
export function DemoStub() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-2xl font-bold">Demo</h1>
      <p className="mt-2 text-muted-foreground">Coming in Phase 3.</p>
    </main>
  );
}
```

- [ ] **Step 6: Route table `routes.tsx`**

```tsx
import type { RouteRecord } from "vite-react-ssg";
import { App } from "@/app";
import { Home } from "@/pages/home";
import { DemoStub } from "@/pages/demo-stub";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "demo", element: <DemoStub /> },
      // /docs/* added in Task 5
    ],
  },
];

// Expanded in Task 6 to enumerate every doc slug.
export async function includedRoutes(paths: string[]) {
  return paths;
}
```

- [ ] **Step 7: `main.tsx` → ViteReactSSG entry**

```tsx
import "./index.css";
import { ViteReactSSG } from "vite-react-ssg";
import { routes, includedRoutes } from "@/routes";

export const createRoot = ViteReactSSG({ routes });
export { includedRoutes };
```
(Remove the old `createRoot(...).render(<BrowserRouter>...)` code.)

- [ ] **Step 8: Build + verify static HTML**

Run: `pnpm --filter shadmin build && pnpm --filter www-v2 build`
Expected: emits `apps/www-v2/dist/index.html` and `apps/www-v2/dist/demo/index.html`.

Run: `grep -o "Docs" apps/www-v2/dist/index.html | head -1`
Expected: prints `Docs` (nav prerendered into HTML).

- [ ] **Step 9: Commit**

```bash
git add apps/www-v2 pnpm-lock.yaml
git commit -m "feat(www-v2): vite-react-ssg entry, route skeleton, top nav, stub pages"
```

---

## Task 4: MDX pipeline (plugins + provider + ported components)

Wire `@mdx-js/rollup` with the kept remark plugins and the ported (de-glassed) MDX component overrides.

**Files:**
- Modify: `apps/www-v2/package.json` (MDX deps)
- Modify: `apps/www-v2/vite.config.ts`
- Create: `apps/www-v2/scripts/remark-code-meta.mjs`, `remark-relative-links.mjs`, `remark-callout-directive.mjs`
- Create: `apps/www-v2/src/docs/mdx/mdx-components.tsx`, `code-block.tsx`, `callout.tsx`, `tabs.tsx`, `install-command.tsx`

**Interfaces:**
- Produces: `.mdx` imports yield `{ default, frontmatter }`; `useMDXComponents` provider; `<InstallCommand install={...} />`.

- [ ] **Step 1: Install MDX deps**

```bash
pnpm --filter www-v2 add react-shiki
pnpm --filter www-v2 add -D @mdx-js/rollup@^3 @mdx-js/react @types/mdx \
  remark-frontmatter@^5 remark-mdx-frontmatter@^5 remark-gfm@^4 \
  remark-directive@^4 unist-util-visit
```

- [ ] **Step 2: Copy the 3 remark plugins verbatim**

```bash
mkdir -p apps/www-v2/scripts
cp apps/website/scripts/remark-code-meta.mjs apps/www-v2/scripts/
cp apps/website/scripts/remark-relative-links.mjs apps/www-v2/scripts/
cp apps/website/scripts/remark-callout-directive.mjs apps/www-v2/scripts/
```
(These are pure unist transforms with no website-specific paths — safe verbatim copy.)

- [ ] **Step 3: Wire MDX in `vite.config.ts`**

Add imports at top:
```ts
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkRelativeLinks } from "./scripts/remark-relative-links.mjs";
import { remarkCalloutDirective } from "./scripts/remark-callout-directive.mjs";
import { remarkCodeMeta } from "./scripts/remark-code-meta.mjs";
```
Add to the `plugins` array, **before** the react plugin:
```ts
{
  enforce: "pre",
  ...mdx({
    providerImportSource: "@/docs/mdx/mdx-components",
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkDirective,
      remarkCodeMeta,
      remarkRelativeLinks,
      remarkCalloutDirective,
    ],
  }),
},
```
Ensure the react plugin keeps `include: /\.(jsx|js|mdx|md|tsx|ts)$/`.

- [ ] **Step 4: Port `callout.tsx` (de-glassed)**

`src/docs/mdx/callout.tsx` — copy from `apps/website/src/docs/mdx/callout.tsx`, then replace the `glass ` class prefix in the `<aside>` className with `bg-card border` (drop the Aurora `glass` utility — not present in www-v2):
```tsx
import { cn } from "shadmin/lib/utils";
import type { ReactNode } from "react";

export type CalloutType = "note" | "tip" | "warning" | "danger";
interface CalloutProps { type?: CalloutType; children: ReactNode; }

const ICONS: Record<CalloutType, string> = { note: "ℹ️", tip: "💡", warning: "⚠️", danger: "🚨" };
const STYLES: Record<CalloutType, string> = {
  note: "border-blue-500/30 bg-blue-500/5 text-blue-900 dark:text-blue-100",
  tip: "border-green-500/30 bg-green-500/5 text-green-900 dark:text-green-100",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-900 dark:text-yellow-100",
  danger: "border-red-500/30 bg-red-500/5 text-red-900 dark:text-red-100",
};
const LABEL: Record<CalloutType, string> = { note: "Note", tip: "Tip", warning: "Warning", danger: "Danger" };

export function Callout({ type = "note", children }: CalloutProps) {
  const t = type in STYLES ? type : ("note" as CalloutType);
  return (
    <aside className={cn("my-4 flex gap-3 rounded-lg border p-4", STYLES[t])} role="note" aria-label={LABEL[t]}>
      <span className="mt-0.5 text-lg leading-none select-none" aria-hidden>{ICONS[t]}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </aside>
  );
}
export default Callout;
```

- [ ] **Step 5: Port `code-block.tsx` (de-glassed)**

Copy `apps/website/src/docs/mdx/code-block.tsx` to `src/docs/mdx/code-block.tsx`, with two edits: import `cn` from `shadmin/lib/utils`, and replace the wrapper className `"glass my-4 ..."` with `"my-4 ..."` (remove `glass`). Keep the `react-shiki` `ShikiHighlighter`, `parseCodeMeta`, `CodeBlock`, and `MdxPre` logic verbatim (full source is in the spec's investigation; it reads `data-meta` set by `remarkCodeMeta`).

- [ ] **Step 6: Port `tabs.tsx` + `install-command.tsx`**

```bash
cp apps/website/src/docs/mdx/tabs.tsx apps/www-v2/src/docs/mdx/tabs.tsx
cp apps/website/src/docs/install-command.tsx apps/www-v2/src/docs/mdx/install-command.tsx
```
Then in both files, fix import paths: `@/lib/utils` → `shadmin/lib/utils`, and any `@/components/ui/*` → `shadmin/components/ui/*`. (install-command renders the tabbed package-manager UI from an `InstallCommands` object.)

- [ ] **Step 7: Create `mdx-components.tsx` provider**

Port from `apps/website/src/docs/mdx/mdx-components.tsx`, dropping `PropsTable` (not needed Phase 1) and keeping `MdxLink`, `MdxImg`, `MdxCode`, `MdxPre`, `Tabs`, `TabItem`, `Callout`. `<ComponentPreview>` is added to this map in Task 7.
```tsx
import type { MDXComponents } from "mdx/types";
import { Link } from "react-router-dom";
import { MdxPre } from "./code-block";
import { Tabs, TabItem } from "./tabs";
import { Callout } from "./callout";

function MdxLink({ href, children, ...rest }: React.ComponentPropsWithoutRef<"a"> & { href?: string }) {
  const url = href ?? "";
  const isInternal = url.startsWith("/") || url.startsWith("#");
  return isInternal
    ? <Link to={url} {...rest}>{children}</Link>
    : <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}
function MdxImg({ src, alt, ...rest }: React.ComponentPropsWithoutRef<"img">) {
  return <img src={src} alt={alt ?? ""} className="my-4 max-w-full rounded-lg border" loading="lazy" {...rest} />;
}
function MdxCode({ children, ...rest }: React.ComponentPropsWithoutRef<"code">) {
  return <code className="font-mono text-[0.875em] bg-muted/60 rounded px-1.5 py-0.5" {...rest}>{children}</code>;
}

const components: MDXComponents = { a: MdxLink, img: MdxImg, pre: MdxPre, code: MdxCode, Tabs, TabItem, Callout };

export function useMDXComponents(inherited: MDXComponents = {}): MDXComponents {
  return { ...inherited, ...components };
}
```

- [ ] **Step 8: Build to verify MDX compiles**

Create a throwaway `src/docs/content/__smoke.mdx`:
```mdx
---
title: "Smoke"
---
:::tip
hello
:::
```
Run: `pnpm --filter shadmin build && pnpm --filter www-v2 build`
Expected: build succeeds (MDX + remark + callout transform all load). Then delete the smoke file: `rm apps/www-v2/src/docs/content/__smoke.mdx`.

- [ ] **Step 9: Commit**

```bash
git add apps/www-v2 pnpm-lock.yaml
git commit -m "feat(www-v2): MDX pipeline + ported de-glassed MDX components"
```

---

## Task 5: Docs engine — glob discovery, _meta ordering, sidebar, page renderer

The heart. A pure tree-builder turns the `content/` glob + `_meta.ts` files into an ordered nav tree; `docs-layout` renders the sidebar; `mdx-page` renders a slug.

**Files:**
- Create: `apps/www-v2/src/docs/types.ts`
- Create: `apps/www-v2/src/docs/registry.ts` + `registry.test.ts`
- Create: `apps/www-v2/src/docs/nav.ts` + `nav.test.ts`
- Create: `apps/www-v2/src/docs/docs-layout.tsx`
- Create: `apps/www-v2/src/docs/mdx-page.tsx`
- Modify: `apps/www-v2/src/routes.tsx` (add `/docs` subtree)

**Interfaces:**
- Consumes: MDX modules from `import.meta.glob`, `registry.json`.
- Produces:
  - `buildNavTree(slugs: string[], metas: Record<string, MetaEntry[]>): DocGroup[]`
  - `installFor(slug: string): InstallCommands | null`
  - `<DocsLayout>` (sidebar + Outlet), `<MdxPage guides={...} />`

- [ ] **Step 1: `types.ts`**

```ts
export interface InstallCommands { npm: string; pnpm: string; yarn: string; bun: string; }

// One entry in a folder's _meta.ts. `slug` = an .mdx in this folder;
// `dir` = a subfolder. `title` overrides the auto title.
export type MetaEntry =
  | { slug: string; title?: string }
  | { dir: string; title?: string };

export interface DocLeaf { kind: "leaf"; slug: string; title: string; }
export interface DocGroup { kind: "group"; dir: string; title: string; children: DocNode[]; }
export type DocNode = DocLeaf | DocGroup;
```

- [ ] **Step 2: Write failing test for `installFor`**

`src/docs/registry.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFor } from "./registry";

test("installFor returns shadcn commands for a real registry component", () => {
  // 'data-table' is a known registry item name.
  const cmds = installFor("components/data-table");
  assert.ok(cmds, "expected install commands");
  assert.equal(cmds.pnpm, "pnpm dlx shadcn@latest add @shadmin/data-table");
});

test("installFor returns null for a non-component guide slug", () => {
  assert.equal(installFor("getting-started/install"), null);
});
```

- [ ] **Step 3: Run — expect FAIL**

Run: `node --test apps/www-v2/src/docs/registry.test.ts`
Expected: FAIL ("Cannot find module './registry'").

- [ ] **Step 4: Implement `registry.ts`**

```ts
import registry from "../../../../packages/shadmin/registry.json" with { type: "json" };
import type { InstallCommands } from "./types";

interface RegistryItem { name: string; }
const names = new Set<string>(
  (registry as { items: RegistryItem[] }).items.map((i) => i.name),
);

function basename(slug: string): string {
  const i = slug.lastIndexOf("/");
  return i === -1 ? slug : slug.slice(i + 1);
}

export function installFor(slug: string): InstallCommands | null {
  const name = basename(slug);
  if (!names.has(name)) return null;
  const ref = `@shadmin/${name}`;
  return {
    npm: `npx shadcn@latest add ${ref}`,
    pnpm: `pnpm dlx shadcn@latest add ${ref}`,
    yarn: `yarn dlx shadcn@latest add ${ref}`,
    bun: `bunx shadcn@latest add ${ref}`,
  };
}
```
> Confirm the relative path to `registry.json` resolves from `src/docs/`; adjust depth if the build complains. Vite supports JSON import attributes; if the TS `with { type: "json" }` syntax errors under the pinned TS, fall back to a plain `import registry from ".../registry.json"`.

- [ ] **Step 5: Run — expect PASS**

Run: `node --test apps/www-v2/src/docs/registry.test.ts`
Expected: PASS (both tests).

- [ ] **Step 6: Write failing test for `buildNavTree`**

`src/docs/nav.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNavTree } from "./nav";

test("buildNavTree orders by _meta then alpha, nests dirs", () => {
  const slugs = [
    "getting-started/install",
    "getting-started/quick-start",
    "components/data-table",
    "components/array-input",
  ];
  const metas = {
    "": [{ dir: "getting-started", title: "Getting Started" }, { dir: "components" }],
    "getting-started": [{ slug: "quick-start", title: "Quick Start" }, { slug: "install" }],
    components: [{ slug: "data-table" }],
  };
  const tree = buildNavTree(slugs, metas);

  // Top order from root _meta: getting-started before components
  assert.equal(tree[0].kind, "group");
  assert.equal((tree[0] as any).dir, "getting-started");
  // Within getting-started: quick-start before install (meta order)
  const gs = tree[0] as any;
  assert.deepEqual(gs.children.map((c: any) => c.slug), [
    "getting-started/quick-start",
    "getting-started/install",
  ]);
  // components: data-table listed in meta first, array-input appended alpha
  const comp = tree[1] as any;
  assert.deepEqual(comp.children.map((c: any) => c.slug), [
    "components/data-table",
    "components/array-input",
  ]);
});
```

- [ ] **Step 7: Run — expect FAIL**

Run: `node --test apps/www-v2/src/docs/nav.test.ts`
Expected: FAIL ("Cannot find module './nav'").

- [ ] **Step 8: Implement `nav.ts`**

```ts
import type { DocGroup, DocNode, MetaEntry } from "./types";

function titleize(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// metas: keyed by dir path ("" = root), value = that folder's _meta entries.
// Pure + testable. Files/dirs not named in _meta are appended alphabetically.
export function buildNavTree(
  slugs: string[],
  metas: Record<string, MetaEntry[]>,
  titleOf: (slug: string) => string = titleize,
): DocGroup[] {
  // group slugs by their immediate dir under each level
  function build(prefix: string): DocNode[] {
    const depth = prefix === "" ? 0 : prefix.split("/").length;
    const here = slugs.filter((s) => s.startsWith(prefix === "" ? "" : prefix + "/"));

    const leafSlugs = new Set<string>();
    const dirNames = new Set<string>();
    for (const s of here) {
      const parts = s.split("/");
      if (parts.length === depth + 1) leafSlugs.add(s);
      else dirNames.add(parts.slice(0, depth + 1).join("/"));
    }

    const meta = metas[prefix] ?? [];
    const ordered: DocNode[] = [];
    const usedLeaf = new Set<string>();
    const usedDir = new Set<string>();

    for (const e of meta) {
      if ("slug" in e) {
        const full = prefix === "" ? e.slug : `${prefix}/${e.slug}`;
        if (leafSlugs.has(full)) {
          ordered.push({ kind: "leaf", slug: full, title: e.title ?? titleOf(full) });
          usedLeaf.add(full);
        }
      } else {
        const full = prefix === "" ? e.dir : `${prefix}/${e.dir}`;
        if (dirNames.has(full)) {
          ordered.push({ kind: "group", dir: full, title: e.title ?? titleize(e.dir), children: build(full) });
          usedDir.add(full);
        }
      }
    }
    // append unlisted, alphabetical
    [...leafSlugs].filter((s) => !usedLeaf.has(s)).sort()
      .forEach((s) => ordered.push({ kind: "leaf", slug: s, title: titleOf(s) }));
    [...dirNames].filter((d) => !usedDir.has(d)).sort()
      .forEach((d) => ordered.push({ kind: "group", dir: d, title: titleize(d.split("/").pop()!), children: build(d) }));

    return ordered;
  }
  return build("") as DocGroup[];
}
```

- [ ] **Step 9: Run — expect PASS**

Run: `node --test apps/www-v2/src/docs/nav.test.ts`
Expected: PASS.

- [ ] **Step 10: Glob wiring (the discovery layer)**

Add to `nav.ts` the build-time glob → slugs + metas (kept out of the pure tester):
```ts
// Eager-glob frontmatter (cheap) for titles; lazy-glob page modules.
const metaModules = import.meta.glob<{ default: MetaEntry[] }>("./content/**/_meta.ts", { eager: true });
const pageModules = import.meta.glob<{ frontmatter?: { title?: string } }>("./content/**/*.mdx", { eager: true });

function toSlug(key: string) {
  return key.replace(/^\.\/content\//, "").replace(/\.mdx$/, "").replace(/\/index$/, "");
}
function toDir(key: string) {
  return key.replace(/^\.\/content\//, "").replace(/\/_meta\.ts$/, "").replace(/^_meta\.ts$/, "");
}

export const docSlugs: string[] = Object.keys(pageModules).map(toSlug);

const metas: Record<string, MetaEntry[]> = {};
for (const [key, mod] of Object.entries(metaModules)) metas[toDir(key)] = mod.default;

const titleBySlug = new Map(
  Object.entries(pageModules).map(([k, m]) => [toSlug(k), m.frontmatter?.title]),
);

export const navTree: DocGroup[] = buildNavTree(docSlugs, metas, (slug) =>
  titleBySlug.get(slug) ?? slug.split("/").pop()!,
);
```

- [ ] **Step 11: `docs-layout.tsx` (sidebar + Outlet)**

```tsx
import { NavLink, Outlet } from "react-router-dom";
import { navTree } from "./nav";
import type { DocNode } from "./types";

function NodeView({ node }: { node: DocNode }) {
  if (node.kind === "group") {
    return (
      <div className="mb-4">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">{node.title}</p>
        <ul>{node.children.map((c) => <NodeView key={c.kind === "leaf" ? c.slug : c.dir} node={c} />)}</ul>
      </div>
    );
  }
  return (
    <li>
      <NavLink to={`/docs/${node.slug}`}
        className={({ isActive }) => `block rounded px-2 py-1 text-sm ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        {node.title}
      </NavLink>
    </li>
  );
}

export function DocsLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      <aside className="w-60 shrink-0"><nav>{navTree.map((n) => <NodeView key={n.dir} node={n} />)}</nav></aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
```

- [ ] **Step 12: `mdx-page.tsx` (slug → module, title, install block)**

```tsx
import { useParams } from "react-router-dom";
import { installFor } from "./registry";
import { InstallCommand } from "./mdx/install-command";

interface GuideModule { default: React.ComponentType; frontmatter?: { title?: string }; }
const guides = import.meta.glob<GuideModule>("./content/**/*.mdx", { eager: true });

const bySlug = new Map(
  Object.entries(guides).map(([k, m]) => [
    k.replace(/^\.\/content\//, "").replace(/\.mdx$/, "").replace(/\/index$/, ""),
    m,
  ]),
);

export function MdxPage() {
  const slug = useParams()["*"] ?? "";
  const mod = bySlug.get(slug);
  if (!mod) {
    return <div className="py-12"><h1 className="text-2xl font-bold">Page not found</h1><p className="text-muted-foreground">No doc for <code>/docs/{slug}</code>.</p></div>;
  }
  const title = mod.frontmatter?.title;
  const install = installFor(slug);
  const Content = mod.default;
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {title && <h1 className="mb-6 text-3xl font-bold tracking-tight">{title}</h1>}
      {install && (
        <div className="not-prose mb-8">
          <p className="mb-2 text-sm font-semibold">Installation</p>
          <InstallCommand install={install} />
        </div>
      )}
      <Content />
    </article>
  );
}
```

- [ ] **Step 13: Add `/docs` subtree to `routes.tsx`**

In the `children` of `/`, add:
```tsx
import { DocsLayout } from "@/docs/docs-layout";
import { MdxPage } from "@/docs/mdx-page";
// ...
{
  path: "docs",
  element: <DocsLayout />,
  children: [{ path: "*", element: <MdxPage /> }],
},
```

- [ ] **Step 14: Smoke content + dev verify**

Create `src/docs/content/getting-started/_meta.ts`:
```ts
import type { MetaEntry } from "@/docs/types";
export default [{ slug: "install", title: "Installation" }] satisfies MetaEntry[];
```
Create `src/docs/content/getting-started/install.mdx`:
```mdx
---
title: "Installation"
---
:::tip
Filesystem-driven docs work.
:::
```
Run: `pnpm --filter shadmin build && pnpm --filter www-v2 dev` (then check `/docs/getting-started/install` renders with sidebar). Stop dev.

- [ ] **Step 15: Run unit tests + typecheck**

Run: `node --test apps/www-v2/src/docs/*.test.ts && pnpm --filter www-v2 typecheck`
Expected: PASS, no type errors.

- [ ] **Step 16: Commit**

```bash
git add apps/www-v2
git commit -m "feat(www-v2): filesystem-driven docs engine (glob + _meta + sidebar + page)"
```

---

## Task 6: Prerender every doc slug (`includedRoutes`)

Expand `includedRoutes` so vite-react-ssg emits one static HTML file per doc page (not just `/docs/*`).

**Files:**
- Modify: `apps/www-v2/src/routes.tsx`

**Interfaces:**
- Consumes: `docSlugs` (Task 5).

- [ ] **Step 1: Expand `includedRoutes`**

```tsx
import { docSlugs } from "@/docs/nav";

export async function includedRoutes(paths: string[]) {
  // paths includes "/", "/demo", and the "/docs/*" splat placeholder.
  const staticPaths = paths.filter((p) => !p.includes("*"));
  const docPaths = docSlugs.map((s) => `/docs/${s}`);
  return [...staticPaths, ...docPaths];
}
```

- [ ] **Step 2: Build + verify per-page HTML**

Run: `pnpm --filter shadmin build && pnpm --filter www-v2 build`
Expected: `apps/www-v2/dist/docs/getting-started/install/index.html` exists.

Run: `test -f apps/www-v2/dist/docs/getting-started/install/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add apps/www-v2/src/routes.tsx
git commit -m "feat(www-v2): prerender every doc slug to static HTML"
```

---

## Task 7: Live previews — `<ComponentPreview>` + `<DemoAdmin>`

Render a real component (from shadmin) live, with a Code tab showing the demo source. Admin-tier demos wrap in a shared fakerest `<Admin>`.

**Files:**
- Modify: `apps/www-v2/package.json` (ra-core, ra-data-fakerest)
- Create: `apps/www-v2/src/docs/demo-kit/demo-admin.tsx`, `demo-kit/seed.ts`
- Create: `apps/www-v2/src/docs/component-preview.tsx`
- Modify: `apps/www-v2/src/docs/mdx/mdx-components.tsx` (register `<ComponentPreview>`)
- Create: `apps/www-v2/src/docs/content/components/data-table/demos/basic.tsx` (exemplar)

**Interfaces:**
- Consumes: shadmin admin components, ra-core.
- Produces: `<ComponentPreview name="<dir>/<demo>" />`, `<DemoAdmin>`.

- [ ] **Step 1: Install demo deps**

Run: `pnpm --filter www-v2 add ra-core ra-data-fakerest`
(Match ra-core to shadmin's: `^5.14.0`.)

- [ ] **Step 2: `seed.ts` — tiny fixture**

```ts
export const seedData = {
  posts: [
    { id: 1, title: "Hello world", views: 12, published: true },
    { id: 2, title: "Second post", views: 4, published: false },
    { id: 3, title: "Third post", views: 99, published: true },
  ],
};
```

- [ ] **Step 3: `demo-admin.tsx` — shared wrapper**

```tsx
import { CoreAdminContext } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import { seedData } from "./seed";
import type { ReactNode } from "react";

const dataProvider = fakeRestProvider(seedData, false);

// Minimal admin context for inline admin-block previews.
export function DemoAdmin({ children }: { children: ReactNode }) {
  return <CoreAdminContext dataProvider={dataProvider}>{children}</CoreAdminContext>;
}
```
> Confirm the exact ra-core context export (`CoreAdminContext`) against the installed ra-core version; if the admin block also needs a `ResourceContext`, wrap with ra-core's `ResourceContextProvider value="posts"`. Mirror how `apps/demo` sets up its provider (reference only).

- [ ] **Step 4: `component-preview.tsx`**

```tsx
import { useState } from "react";
import { ShikiHighlighter } from "react-shiki";

// Demo modules + their raw source, globbed from content.
const demos = import.meta.glob<{ default: React.ComponentType }>("./content/**/demos/*.tsx", { eager: true });
const sources = import.meta.glob("./content/**/demos/*.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

function keyFor(name: string) {
  // name = "<component-dir>/<demo>" → match a glob key ending in /<...>/demos/<demo>.tsx
  return Object.keys(demos).find((k) => k.endsWith(`/${name.split("/").slice(-2).join("/demos/")}.tsx`))
    ?? Object.keys(demos).find((k) => k.endsWith(`/demos/${name.split("/").pop()}.tsx`));
}

export function ComponentPreview({ name }: { name: string }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const k = keyFor(name);
  if (!k) return <div className="my-4 rounded border border-destructive p-4 text-sm">Demo not found: {name}</div>;
  const Demo = demos[k].default;
  const source = sources[k] ?? "";
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border">
      <div className="flex gap-1 border-b bg-muted/30 p-1">
        {(["preview", "code"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded px-3 py-1 text-sm ${tab === t ? "bg-background font-medium" : "text-muted-foreground"}`}>
            {t === "preview" ? "Preview" : "Code"}
          </button>
        ))}
      </div>
      {tab === "preview"
        ? <div className="p-6"><Demo /></div>
        : <div className="overflow-x-auto text-sm"><ShikiHighlighter language="tsx" theme={{ light: "github-light", dark: "github-dark" }} addDefaultStyles={false} className="!bg-transparent p-4">{source}</ShikiHighlighter></div>}
    </div>
  );
}
```
> The `keyFor` matcher is intentionally simple; if naming collisions arise during Task 8, switch `name` to the full content-relative path. Keep `name="<component-dir>/<demo-file>"` as the convention.

- [ ] **Step 5: Register in MDX provider**

In `mdx/mdx-components.tsx`, import and add `ComponentPreview` to the `components` map:
```tsx
import { ComponentPreview } from "../component-preview";
// ...
const components: MDXComponents = { /* ...existing..., */ ComponentPreview };
```

- [ ] **Step 6: Exemplar primitive demo + admin demo**

`content/components/data-table/demos/basic.tsx`:
```tsx
import { Button } from "shadmin/components/ui/button";
export default function Basic() {
  return <Button>Real shadmin button</Button>;
}
```
(Start with a primitive to prove the path end-to-end; an admin-block demo wrapped in `<DemoAdmin>` follows in Task 8 once a concrete block + its required ra-core context are confirmed.)

`content/components/data-table/index.mdx`:
```mdx
---
title: "Data Table"
---
<ComponentPreview name="data-table/basic" />
```
And `content/components/_meta.ts`:
```ts
import type { MetaEntry } from "@/docs/types";
export default [{ dir: "data-table", title: "Data Table" }] satisfies MetaEntry[];
```

- [ ] **Step 7: Build + verify preview renders**

Run: `pnpm --filter shadmin build && pnpm --filter www-v2 build`
Expected: build OK; `dist/docs/components/data-table/index.html` contains `Real shadmin button` (preview prerendered).

Run: `grep -o "Real shadmin button" apps/www-v2/dist/docs/components/data-table/index.html | head -1`
Expected: prints the string.

- [ ] **Step 8: Commit**

```bash
git add apps/www-v2 pnpm-lock.yaml
git commit -m "feat(www-v2): ComponentPreview + DemoAdmin live previews"
```

---

## Task 8: Migrate the 293 MDX + author `_meta.ts`

Move the real prose in, organize into the nav, and convert a curated set of pages to live previews. This is iterative — do it in sub-batches, building between each.

**Files:**
- Create: `apps/www-v2/src/docs/content/**` (migrated MDX + `_meta.ts` + demos)
- Delete: nothing in website yet (teardown is Phase 4)

**Interfaces:**
- Consumes: docs engine (Task 5), `<ComponentPreview>` (Task 7).

- [ ] **Step 1: Copy content tree in**

```bash
cp -R apps/website/src/docs/content/* apps/www-v2/src/docs/content/
```
Remove any website-only artifacts that aren't pages (none expected — verify no stray `.ts`/`.json` got copied; only `.mdx` should be page content): `find apps/www-v2/src/docs/content -type f ! -name '*.mdx' ! -name '_meta.ts'`.

- [ ] **Step 2: Organize into folders**

Group component docs under `components/<name>/index.mdx` (rename `components/<name>.mdx` → `components/<name>/index.mdx`) and guides under topical folders (`getting-started/`, `data/`, `security/`, etc.). Mirror the *intended* sidebar — this replaces the old `categoryExtras` overlay. Keep slugs stable where possible to avoid breaking cross-links.

- [ ] **Step 3: Author `_meta.ts` per folder**

Root `content/_meta.ts` orders top sections; each folder gets a `_meta.ts` ordering its pages. Only list what needs explicit order/title; the rest auto-append alphabetically with frontmatter titles. Example root:
```ts
import type { MetaEntry } from "@/docs/types";
export default [
  { dir: "getting-started", title: "Getting Started" },
  { dir: "components", title: "Components" },
  { dir: "data", title: "Data" },
  { dir: "security", title: "Security" },
] satisfies MetaEntry[];
```

- [ ] **Step 4: Build + fix broken links/frontmatter**

Run: `pnpm --filter www-v2 build`
Expected: build completes. Fix any MDX that fails to compile (usually a stray JSX-like `<` in prose — wrap in backticks). The relative-link plugin rewrites `./x.md` → `/docs/x`; verify a few links resolve after the folder reorg (slugs changed → update intra-doc links where the reorg moved a page).

- [ ] **Step 5: Convert curated pages to live previews**

For ~5–10 flagship components (data-table, array-input, the common inputs), add `demos/*.tsx` and `<ComponentPreview>` blocks. Admin blocks: wrap the demo in `<DemoAdmin>` and a `ResourceContextProvider` as needed. Leave the long tail as prose + code blocks for now (live previews can be added incrementally — note which pages still lack them).

- [ ] **Step 6: Build + spot-check**

Run: `pnpm --filter shadmin build && pnpm --filter www-v2 build`
Expected: OK; `dist/docs/**` has one folder per page. Run dev and click through the sidebar groups.

- [ ] **Step 7: Commit**

```bash
git add apps/www-v2/src/docs/content
git commit -m "feat(www-v2): migrate docs content + _meta ordering + flagship live previews"
```

---

## Task 9: Phase 1 cleanup + full verification

**Files:**
- Delete: any leftover stale files in `apps/www-v2` (old `scripts/` placeholders, smoke fixtures)
- Modify: `apps/www-v2/package.json` (`test` script runs the node tests)

**Interfaces:** none (closeout).

- [ ] **Step 1: Remove stragglers**

Confirm no `apps/www-v2/scripts/generate-docs-manifest.mjs` / `check-manifest-drift.mjs` / `registry-manifest.json` were created (they must NOT exist — the filesystem model replaces them). Remove if present.
Run: `ls apps/www-v2/scripts` → only the 3 `remark-*.mjs`.

- [ ] **Step 2: Set the test script**

In `apps/www-v2/package.json`:
```json
"test": "node --test \"src/**/*.test.ts\""
```

- [ ] **Step 3: Full gate (parallel)**

Run together:
```bash
pnpm --filter shadmin build
pnpm --filter www-v2 typecheck
pnpm --filter www-v2 test
pnpm --filter www-v2 build
```
Expected: all green. (Run lint too if www-v2 has a lint script.)

- [ ] **Step 4: Verify the GitHub Pages output shape**

`apps/www-v2/dist/` should contain: `index.html` (home), `demo/index.html`, `docs/**/index.html` per page, hashed assets. Confirm a docs page opens standalone (real HTML, not an empty SPA shell):
Run: `grep -c "<h1" apps/www-v2/dist/docs/components/data-table/index.html`
Expected: ≥ 1 (content is prerendered, not client-only).

- [ ] **Step 5: Commit**

```bash
git add apps/www-v2
git commit -m "chore(www-v2): phase 1 cleanup + full-suite verification"
```

---

## Self-Review (completed)

**Spec coverage:**
- D1 one app — Tasks 3/5/6 (routes, /docs, /demo stub). ✓
- D2 Vite SPA + prerender — Task 3 (vite-react-ssg) + Task 6 (per-slug HTML). ✓
- D3 kill dual copy — Task 2. ✓
- D4 build shadmin to dist — Task 1. ✓
- D5 filesystem docs nav — Task 5 (glob + _meta, no manifest). ✓ Cleanup Task 9 guards against re-introducing the manifest.
- D6 preview + code + DemoAdmin — Task 7. ✓
- D7 no Sandpack — honored (Code tab is read-only Shiki). ✓
- D8 demo = reference not copy — only a `/demo` stub (Task 3); no copy. ✓
- D9 phased — this plan is Phase 1 only. ✓
- Top nav + theming — Task 3 nav; theme via `@source` + shadmin styles (Task 2 / can import `shadmin/styles/*` if a base theme is needed — add in Task 2 Step 2 if the site looks unthemed). ✓
- Migration of 293 MDX — Task 8. ✓
- Kept remark plugins — Task 4. ✓

**Placeholder scan:** No TBD/TODO. The few `>` notes are explicit verification guards (confirm path depth, confirm ra-core export name), not deferred work — each names the exact thing to check and the fallback.

**Type consistency:** `MetaEntry`/`DocNode`/`DocGroup` defined in Task 5 Step 1, used consistently in `nav.ts`/`docs-layout.tsx`. `InstallCommands` defined Task 5, consumed by `installFor` + `install-command.tsx`. `buildNavTree`/`installFor`/`docSlugs`/`navTree` signatures match across tasks.

**Known soft spots flagged for execution (not placeholders):**
- shadmin full-tree emit could surface an unexpected error on a heavy module — Task 1 Step 5 says investigate, don't suppress.
- ra-core context shape for admin-block previews — Task 7 Step 3 says confirm against installed version, mirror apps/demo.
- `registry.json` relative-import depth + JSON import-attribute syntax — Task 5 Step 4 gives the fallback.
