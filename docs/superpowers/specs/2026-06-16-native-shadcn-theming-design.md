# Native shadcn theming via the registry

**Date:** 2026-06-16
**Status:** Approved (brainstorm), pending implementation plan
**Scope:** `packages/shadmin`, `apps/demo`. Out of scope: `apps/website`, `apps/docs`.

## Problem

shadmin carries a react-admin-style runtime theming system: named palettes are
authored as TypeScript objects (`AdminTheme`) and injected into
`document.documentElement.style` at runtime by `<ThemeProvider>`. This is foreign
to the shadcn model, and it does not distribute: the registry currently ships
**zero** `cssVars`/`css` items, so a downstream `npx shadcn add @shadmin/admin`
delivers components with **no theme tokens at all**.

Replace it with native shadcn theming:
1. Theme tokens live in CSS, distributed through the registry as `cssVars`/`css`.
2. The default theme is shadcn-neutral (unchanged `index.css`).
3. The alternate palettes (aurora, bw, house, nano, radiant) become opt-in
   `registry:theme` items a downstream dev installs by name.
4. A runtime palette switcher exists **only in `apps/demo`** as a showcase; the
   distributed package has no runtime palette layer.

## Two layers, kept apart

The current code conflates two unrelated concerns under the word "theme":

- **Mode** — light/dark/system. The `.dark` class on `<html>`, persisted via
  ra-core `useStore`. This is standard shadcn dark mode. **Keep.**
- **Palette** — the `AdminTheme` objects + `theme`/`lightTheme`/`darkTheme` props +
  `useThemes`/`liveVars`/`setLiveVar` runtime injection. This is the react-admin
  layer. **Remove.**

## Source of truth: one scoped-class CSS file per palette

Delete all of `packages/shadmin/src/lib/themes/*.ts` (11 files). Author each
alternate palette as a CSS file in `packages/shadmin/src/styles/themes/`:
`aurora.css`, `bw.css`, `house.css`, `nano.css`, `radiant.css`. Each uses
**scoped class selectors** so multiple palettes can coexist in one bundle (needed
for the demo switcher) and so the registry generator can de-scope them:

```css
/* src/styles/themes/bw.css */
.theme-bw      { --primary: oklch(...); --background: oklch(...); /* …light… */ }
.theme-bw.dark { --primary: oklch(...); --background: oklch(...); /* …dark…  */ }
```

- **Default** = the existing `index.css` `:root` / `.dark` (shadcn-neutral),
  untouched. No class, no palette file. It is the baseline every component renders
  against; the palettes only override it.
- **Specificity / order:** `index.css` loads before the palette files;
  `.theme-x` (0,1,0) ties with `:root` and wins on source order; `.theme-x.dark`
  (0,2,0) beats both `:root` and `.dark` in dark mode. `<html>` carries both
  classes, e.g. `class="dark theme-bw"`.
- The token values are ported verbatim from the corresponding deleted
  `*-theme.ts` `light`/`dark` maps. No re-coloring.

The aurora **additive layer** (`src/styles/aurora.css` — `--aurora` gradient,
`--glass-*`, `--orb-*`, and the `@utility` rules) stays where it is and stays
imported by `index.css`. It is unchanged and shared by demo/website/docs at
runtime. It is *not* a palette file; the aurora semantic palette
(`src/styles/themes/aurora.css`) is separate.

## Registry emission

Teach `scripts/generate-registry.mjs` a small CSS-variable parser
(regex over `--key: value;` declarations inside a named block). Used for:

1. **Admin block `cssVars`** — parse `index.css` `:root` → `cssVars.light` and
   `.dark` → `cssVars.dark` (keys emitted **without** the leading `--`, per
   shadcn convention). This finally ships working default tokens downstream. The
   `@theme inline` mapping block in `index.css` is **not** emitted (it is Tailwind
   plumbing the consumer already gets from `shadcn init`).
2. **Five `registry:theme` items** — `theme-aurora`, `theme-bw`, `theme-house`,
   `theme-nano`, `theme-radiant`. For each, parse `.theme-<name>` →
   `cssVars.light` and `.theme-<name>.dark` → `cssVars.dark` from its palette
   file. Downstream install: `npx shadcn add @shadmin/theme-bw`.
3. **`theme-aurora` extras** — additionally fold in the aurora additive layer:
   - the additive **vars** from `src/styles/aurora.css` (`--aurora` → `cssVars.theme`;
     `--glass-*`/`--orb-*` → `cssVars.light`/`cssVars.dark`), parsed automatically;
   - the additive **utilities** (`@utility glass|bezel|text-aurora|bg-aurora`) as a
     **hand-authored `css` literal** in `registry.config.mjs` (see below).
   So `npx shadcn add @shadmin/theme-aurora` gives the full aurora look (colors +
   gradient + glass) and nobody who skips it pays for it.

### Why the aurora utilities are hand-authored

Parsing `--x: y;` into JSON is a 3-line regex. Parsing `@utility glass { … }`
into the registry's nested-object `css` shape needs a real CSS AST parser. For 4
stable utility blocks that change ~never, a hand-written JSON literal on the
`theme-aurora` config entry is cheaper to write and maintain than a parser. Shape:

```jsonc
"css": {
  "@utility glass": {
    "background": "var(--glass-bg)",
    "border": "1px solid var(--glass-border)",
    "backdrop-filter": "blur(var(--glass-blur))",
    "box-shadow": "var(--glass-shadow), var(--glass-inset)"
  },
  "@utility bezel": { /* … */ },
  "@utility text-aurora": {
    "background": "var(--aurora)", "background-clip": "text", "color": "transparent"
  },
  "@utility bg-aurora": { "background": "var(--aurora)" }
}
```

**Finding that justifies the split:** zero shipped admin/extras components use
`glass`/`bg-aurora`/`text-aurora`/`bezel` (grep, 0 hits) — they are website/demo
chrome only. So the additive layer is *not* required for distributed components to
render correctly, which is why it rides with the optional `theme-aurora` item
rather than the base block.

**Verified empirically (shadcn@3.8.5, the pinned version):** running
`shadcn add` on a `registry:theme` item carrying both `cssVars` and a `css`
`@utility` block rewrites the consumer's `globals.css` correctly —
`cssVars.light`/`dark` merge into `:root`/`.dark`, `cssVars.theme` lands in
`@theme inline` (with auto-derived `--color-*` mappings), and each `@utility`
rule is appended verbatim so Tailwind v4 generates the real classes. The `css`
mechanism is confirmed, not assumed. Requires a Tailwind v4 consumer
(`@utility` is v4-only) — already this registry's target.

## ThemeStudio — kept, repointed off the palette system

`src/components/extras/theme-studio.tsx` stays a shipped extra but drops all
dependence on `useThemes`/`liveVars`/`setLiveVar`/`ThemesContext`:

- **Seed:** on mount (and on mode flip), read current values via
  `getComputedStyle(document.documentElement)` over a **static token-name list**
  (the shadcn semantic tokens — `--background`, `--foreground`, `--primary`, …).
- **Edit:** write live to `document.documentElement.style.setProperty(key, value)`.
  Inline style overrides any active `.theme-*` class, so edits preview correctly
  on top of whatever palette is active.
- **State:** keep a per-mode local map (light/dark) seeded from computed styles,
  so flipping modes and back preserves edits — mirrors the old per-mode behavior
  without the context.
- **Export:** emit a CSS snippet — `:root { … }` (and `.dark { … }` once the dark
  map has been populated) — instead of a TypeScript `AdminTheme` object.

## Removals & rewrites

**Delete:**
- `src/lib/themes/{aurora,bw,default,house,nano,radiant}-theme.ts`
- `src/lib/themes/default-theme.spec.ts`
- `src/lib/themes/theme-types.ts`, `themes-context.ts`, `index.ts`
- `src/components/admin/themes.stories.tsx`

**Relocate (so `lib/themes/` is fully removed):**
- `src/lib/themes/theme-context.ts` → `src/lib/theme-context.ts` (the light/dark
  MODE context — kept). Update imports in `use-theme.ts`, `theme-provider.tsx`,
  `theme-mode-toggle.tsx`.

**Keep (mode layer):**
- `src/hooks/use-theme.ts` (`useTheme`, `useResolvedTheme`) and its spec
- `src/components/admin/theme-mode-toggle.tsx`

**Rewrite:**
- `src/components/admin/theme-provider.tsx` — strip palette props
  (`theme`/`lightTheme`/`darkTheme`), `liveVars`/`setLiveVar`, `ThemesContext`,
  the resync effects and applied-keys reconcile. Keep mode (`useStore` + `.dark`
  class + cleanup). ~200 → ~70 lines.
- `src/components/admin/admin.tsx` — remove the `theme`/`lightTheme`/`darkTheme`
  props from `AdminProps`/internal props, the JSX passing them to
  `<ThemeProvider>`, and the palette JSDoc examples.
- `src/components/admin/index.ts` — drop any `lib/themes` re-exports.
- `scripts/registry.config.mjs` — remove the 10 `themes/*.ts` extraFiles; add
  `{ path: "src/lib/theme-context.ts", type: "registry:lib" }`; add admin-block
  `cssVars`; add the 5 `registry:theme` block entries; add the hand-authored
  `theme-aurora` `css`.
- `scripts/generate-registry.mjs` — add the CSS-var parser + theme-item emission.

**Stories/specs touched:**
- `admin.stories.tsx` — remove `import { bwTheme }` + `theme={bwTheme}`.
- `theme-studio.stories.tsx` — remove `import { defaultTheme }` + `theme=` wrapper;
  wrap in a plain `<ThemeProvider>`.
- `theme-studio.spec.tsx` — update to the repointed API (no `useThemes`).
- ~40 other `<ThemeProvider defaultTheme=…>` story usages are **mode-only**,
  untouched.

**`apps/demo`:**
- New `src/theme-switcher.tsx` — sets exactly one `.theme-*` class on `<html>`
  (clearing the others), persists the choice (ra-core `useStore` or localStorage),
  **defaults to aurora**. Surfaced in `admin-tools-drawer.tsx` beside
  `ThemeStudioButton`.
- Import the 5 palette CSS files (workspace path into `shadmin/src/styles/themes/`)
  so they are present in the demo bundle for runtime switching.
- `app.crm.tsx` — remove `import { auroraTheme }` and `theme={auroraTheme}`; the
  demo-wide switcher (default aurora) supplies the look.

## Risks / edge cases

- **Import order in the demo** — palette files must load after `index.css` or the
  `.theme-*` overrides lose the source-order tie with `:root`. Enforce via the
  demo entry CSS import order; verify in the dev-server smoke test.
- **shadcn cssVars key format** — keys must omit the `--` prefix. Parser strips it.
- **ThemeStudio dark export** — the dark map is only populated once the user has
  visited dark mode; export emits `.dark { … }` only when non-empty. Acceptable;
  documented in the component.
- **`registry:theme` is destructive downstream** — installing one overwrites the
  consumer's tokens (by design). Call this out in the registry/docs blurb.

## Verification

- `pnpm typecheck` (package) + per-app typecheck; `biome check` (package + apps).
- `pnpm registry:generate` + `registry:build` + `scripts/test-registry.sh`;
  assert admin block has non-empty `cssVars` and 5 `theme-*` items exist with
  `cssVars.light`/`cssVars.dark`, and `theme-aurora` has the `css` utilities.
- Affected specs: `theme-studio.spec.tsx`, `use-theme.spec.tsx`, and any
  `admin`/`theme-provider` spec (browser provider — run once at the end).
- Demo dev-server smoke: switcher flips palettes live in both light and dark; the
  default load is aurora; ThemeStudio edits preview and export valid CSS.
