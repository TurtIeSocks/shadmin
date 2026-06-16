# Native shadcn theming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace shadmin's react-admin-style TypeScript theme-palette system with native shadcn theming — palettes authored as CSS, distributed through the registry as `cssVars`/`css` — while keeping the light/dark mode layer.

**Architecture:** Default tokens stay in `src/index.css` (`:root`/`.dark`), untouched. The 5 alternate palettes become scoped-class CSS files (`.theme-<name>` / `.theme-<name>.dark`) in `src/styles/themes/`. The registry generator parses those files into `registry:theme` items and parses `index.css` into the admin block's `cssVars`. `ThemeStudio` is repointed to read `getComputedStyle` + export CSS. A runtime palette switcher lives only in `apps/demo`.

**Tech Stack:** React 19, ra-core, Tailwind v4, shadcn registry (`registry:theme`/`cssVars`/`css`), Node ESM build scripts, vitest browser provider, biome.

**Spec:** `docs/superpowers/specs/2026-06-16-native-shadcn-theming-design.md`

**Conventions for every task:** Commit straight to `main` (repo rule — no feature branch, no push). Run `pnpm` from `packages/shadmin/` for package scripts unless a path says otherwise. After each task the tree must typecheck.

---

### Task 1: Author the 5 palette CSS files

Convert each `src/lib/themes/<name>-theme.ts` palette object into a scoped-class
CSS file. The TS files still exist (deleted in Task 6) — read each one and
transcribe its `light` map into `.theme-<name> { … }` and its `dark` map into
`.theme-<name>.dark { … }`, turning every `"--key": "value"` pair into
`--key: value;`. Drop the `name`/`label` fields.

**Files:**
- Create: `packages/shadmin/src/styles/themes/aurora.css` (from `lib/themes/aurora-theme.ts`)
- Create: `packages/shadmin/src/styles/themes/bw.css` (from `lib/themes/bw-theme.ts`)
- Create: `packages/shadmin/src/styles/themes/house.css` (from `lib/themes/house-theme.ts`)
- Create: `packages/shadmin/src/styles/themes/nano.css` (from `lib/themes/nano-theme.ts`)
- Create: `packages/shadmin/src/styles/themes/radiant.css` (from `lib/themes/radiant-theme.ts`)

- [ ] **Step 1: Worked example — write `bw.css`**

Source `lib/themes/bw-theme.ts` has `light`/`dark` maps. The CSS file is:

```css
/* Black & White — high-contrast monochrome. Ported from the removed bw-theme.ts. */
.theme-bw {
  --radius: 0.25rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.09 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.09 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.09 0 0);
  --primary: oklch(0.15 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.95 0 0);
  --secondary-foreground: oklch(0.15 0 0);
  --muted: oklch(0.95 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --accent: oklch(0.92 0 0);
  --accent-foreground: oklch(0.15 0 0);
  --destructive: oklch(0.3 0 0);
  --border: oklch(0.85 0 0);
  --input: oklch(0.85 0 0);
  --ring: oklch(0.45 0 0);
  --chart-1: oklch(0.2 0 0);
  --chart-2: oklch(0.4 0 0);
  --chart-3: oklch(0.55 0 0);
  --chart-4: oklch(0.7 0 0);
  --chart-5: oklch(0.82 0 0);
  --sidebar: oklch(0.98 0 0);
  --sidebar-foreground: oklch(0.09 0 0);
  --sidebar-primary: oklch(0.15 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.92 0 0);
  --sidebar-accent-foreground: oklch(0.15 0 0);
  --sidebar-border: oklch(0.85 0 0);
  --sidebar-ring: oklch(0.45 0 0);
}
.theme-bw.dark {
  --radius: 0.25rem;
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);
  --card: oklch(0.08 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.08 0 0);
  --popover-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0.09 0 0);
  --secondary: oklch(0.18 0 0);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.18 0 0);
  --muted-foreground: oklch(0.7 0 0);
  --accent: oklch(0.22 0 0);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.85 0 0);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 18%);
  --ring: oklch(0.55 0 0);
  --chart-1: oklch(0.95 0 0);
  --chart-2: oklch(0.75 0 0);
  --chart-3: oklch(0.55 0 0);
  --chart-4: oklch(0.35 0 0);
  --chart-5: oklch(0.2 0 0);
  --sidebar: oklch(0.05 0 0);
  --sidebar-foreground: oklch(1 0 0);
  --sidebar-primary: oklch(1 0 0);
  --sidebar-primary-foreground: oklch(0.09 0 0);
  --sidebar-accent: oklch(0.22 0 0);
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(1 0 0 / 12%);
  --sidebar-ring: oklch(0.55 0 0);
}
```

- [ ] **Step 2: Write the other 4 files the same way**

Read `aurora-theme.ts`, `house-theme.ts`, `nano-theme.ts`, `radiant-theme.ts`
and apply the identical transform → `aurora.css`, `house.css`, `nano.css`,
`radiant.css`, each with a `.theme-<name>` block (light map) and a
`.theme-<name>.dark` block (dark map). Copy every value **verbatim** — no
re-coloring. If a palette omits `dark`, reuse its `light` values in the
`.theme-<name>.dark` block.

- [ ] **Step 3: Verify the files are well-formed**

Run:
```bash
cd packages/shadmin && node -e '
const fs=require("node:fs");
for (const n of ["aurora","bw","house","nano","radiant"]) {
  const css=fs.readFileSync(`src/styles/themes/${n}.css`,"utf8");
  if(!css.includes(`.theme-${n} {`)) throw new Error(`${n}: missing light block`);
  if(!css.includes(`.theme-${n}.dark {`)) throw new Error(`${n}: missing dark block`);
  if(!/--primary:/.test(css)) throw new Error(`${n}: missing --primary`);
}
console.log("OK 5 palette files");
'
```
Expected: `OK 5 palette files`

- [ ] **Step 4: Commit**
```bash
git add packages/shadmin/src/styles/themes/
git commit -m "feat(themes): author 5 palette CSS files (scoped .theme-* classes)"
```

---

### Task 2: Relocate the mode context out of `lib/themes/`

`theme-context.ts` is the light/dark **mode** context (kept). Move it to
`src/lib/` so `lib/themes/` can be deleted wholesale later.

**Files:**
- Move: `packages/shadmin/src/lib/themes/theme-context.ts` → `packages/shadmin/src/lib/theme-context.ts`
- Modify: `packages/shadmin/src/hooks/use-theme.ts` (import path)
- Modify: `packages/shadmin/src/components/admin/theme-provider.tsx` (import path)
- Modify: `packages/shadmin/src/lib/themes/index.ts` (drop the theme-context re-export)

- [ ] **Step 1: git mv the file**
```bash
cd packages/shadmin
git mv src/lib/themes/theme-context.ts src/lib/theme-context.ts
```

- [ ] **Step 2: Update `use-theme.ts` import**

In `src/hooks/use-theme.ts`, change:
```ts
} from "@/lib/themes/theme-context";
```
to:
```ts
} from "@/lib/theme-context";
```

- [ ] **Step 3: Update the (current) `theme-provider.tsx` import**

In `src/components/admin/theme-provider.tsx`, change the import source
`@/lib/themes/theme-context` → `@/lib/theme-context`. (This file is fully
rewritten in Task 3; this one-line fix just keeps the tree compiling now.)

- [ ] **Step 4: Drop the re-export from the barrel**

In `src/lib/themes/index.ts`, delete the line:
```ts
export * from "./theme-context";
```

- [ ] **Step 5: Typecheck**

Run: `cd packages/shadmin && pnpm typecheck`
Expected: PASS (no errors).

- [ ] **Step 6: Commit**
```bash
git add packages/shadmin/src
git commit -m "refactor(themes): relocate mode context to src/lib/theme-context.ts"
```

---

### Task 3: Rewrite `theme-provider.tsx` (mode-only)

Strip the palette layer (`theme`/`lightTheme`/`darkTheme` props, `liveVars`,
`setLiveVar`, `ThemesContext`, the resync + reconcile effects). Keep mode.

**Files:**
- Modify (replace whole file): `packages/shadmin/src/components/admin/theme-provider.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import { useEffect, useMemo } from "react";
import { useStore } from "ra-core";

import {
  ThemeProviderContext,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme-context";

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Initial mode when no user preference has been persisted yet. Named
   * `defaultTheme` for backwards compatibility — it configures the *mode*
   * (light/dark/system), not a palette.
   */
  defaultTheme?: Theme;
  storageKey?: string;
}

function resolveMode(mode: Theme): ResolvedTheme {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Theme provider that manages the active light/dark mode.
 *
 * The mode is persisted via ra-core's `useStore` and applied as a class
 * (`light`/`dark`) on `<html>` so Tailwind `dark:` variants and the shadcn
 * `.dark` token block resolve. Theme *palettes* are no longer a runtime
 * concern — tokens live in CSS (`src/index.css`, the `src/styles/themes/*`
 * palette files, and the registry `cssVars`).
 *
 * @internal
 */
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [mode, setMode] = useStore<Theme>(storageKey, defaultTheme);
  const effectiveMode = resolveMode(mode);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effectiveMode);
  }, [effectiveMode]);

  const value = useMemo(
    () => ({ theme: mode, setTheme: setMode }),
    [mode, setMode],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export { ThemeProvider };
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/shadmin && pnpm typecheck`
Expected: PASS. (Errors here mean a consumer still passes a palette prop — those
are fixed in Task 4. If the only errors are in `admin.tsx`/`theme-studio.tsx`,
proceed; they are addressed next. If you prefer a green gate, run Task 4 before
typechecking.)

- [ ] **Step 3: Commit**
```bash
git add packages/shadmin/src/components/admin/theme-provider.tsx
git commit -m "refactor(themes): strip palette layer from ThemeProvider (mode-only)"
```

---

### Task 4: Remove palette props from `Admin`

**Files:**
- Modify: `packages/shadmin/src/components/admin/admin.tsx`
- Modify: `packages/shadmin/src/components/admin/index.ts` (no change expected — verify)

- [ ] **Step 1: Remove the `AdminTheme` import**

In `admin.tsx`, delete:
```ts
import type { AdminTheme } from "@/lib/themes/theme-types";
```

- [ ] **Step 2: Remove the three props from both props interfaces**

In `admin.tsx`, the `AdminProps` interface and the `AdminUIProps` interface each
declare:
```ts
  theme?: AdminTheme;
  lightTheme?: AdminTheme;
  darkTheme?: AdminTheme;
```
Delete those three lines (and any surrounding JSDoc that documents them) from
**both** interfaces.

- [ ] **Step 3: Remove them from the `AdminUI` destructure + JSX**

In `AdminUI`, remove `darkTheme`, `lightTheme`, `theme` from the destructured
`props`, and change:
```tsx
    <ThemeProvider theme={theme} lightTheme={lightTheme} darkTheme={darkTheme}>
```
to:
```tsx
    <ThemeProvider>
```

- [ ] **Step 4: Remove them from the public `Admin` component**

Further down `admin.tsx`, the `Admin` wrapper destructures and forwards
`theme`/`lightTheme`/`darkTheme` to `<AdminUI …>`. Remove those from its
destructure and from the `<AdminUI>` JSX props.

- [ ] **Step 5: Delete the palette JSDoc examples**

Remove the `@example` blocks in `admin.tsx` that import from `@/lib/themes`
(the `radiantTheme` / `nanoTheme` / `bwTheme` snippets). Leave the
`AdminContext`/`AdminUI`/`CommandMenu` example intact.

- [ ] **Step 6: Typecheck**

Run: `cd packages/shadmin && pnpm typecheck`
Expected: PASS except possibly `theme-studio.tsx` (fixed in Task 5) and the
story files (fixed in Task 6). No errors in `admin.tsx`.

- [ ] **Step 7: Commit**
```bash
git add packages/shadmin/src/components/admin/admin.tsx
git commit -m "refactor(themes): drop theme/lightTheme/darkTheme props from Admin"
```

---

### Task 5: Repoint `ThemeStudio` off the palette context

Replace the `useThemes` dependency with a self-contained hook that seeds from
`getComputedStyle` and writes live edits via `style.setProperty`; change the
export to emit a CSS snippet.

**Files:**
- Create: `packages/shadmin/src/components/extras/theme-studio-vars.ts`
- Modify: `packages/shadmin/src/components/extras/theme-studio.tsx`
- Modify: `packages/shadmin/src/components/extras/theme-studio.stories.tsx`
- Modify: `packages/shadmin/src/components/extras/theme-studio.spec.tsx`
- Modify: `packages/shadmin/vitest.browser-setup.ts` (load tokens for tests)

- [ ] **Step 1: Create the `theme-studio-vars.ts` hook**

```ts
import { useCallback, useEffect, useState } from "react";

import { useResolvedTheme } from "@/hooks/use-theme";

/** Semantic design tokens ThemeStudio exposes for editing. */
export const THEME_TOKENS = [
  "--radius",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

export type ThemeVars = Record<string, string>;

/** Read the current resolved value of each token off `:root`. */
const readVars = (): ThemeVars => {
  if (typeof window === "undefined") return {};
  const cs = getComputedStyle(document.documentElement);
  const out: ThemeVars = {};
  for (const key of THEME_TOKENS) {
    const value = cs.getPropertyValue(key).trim();
    if (value) out[key] = value;
  }
  return out;
};

export interface UseThemeVarsResult {
  /** Editable map for the active mode. */
  vars: ThemeVars;
  /** Set one token: writes inline to `:root` and records the edit. */
  setVar: (key: string, value: string) => void;
  /** Per-mode edited maps, used by the CSS export. */
  light: ThemeVars;
  dark: ThemeVars;
}

/**
 * Self-contained replacement for the old `useThemes` palette context.
 *
 * Seeds the active mode's map from `getComputedStyle` on mount and on every
 * mode flip (only when that mode has no edits yet). Edits are written straight
 * to `document.documentElement.style`, which overrides any active `.theme-*`
 * class, so the preview reflects changes instantly.
 */
export function useThemeVars(): UseThemeVarsResult {
  const mode = useResolvedTheme();
  const [light, setLight] = useState<ThemeVars>({});
  const [dark, setDark] = useState<ThemeVars>({});

  useEffect(() => {
    if (mode === "dark") {
      setDark((cur) => (Object.keys(cur).length ? cur : readVars()));
    } else {
      setLight((cur) => (Object.keys(cur).length ? cur : readVars()));
    }
  }, [mode]);

  const setVar = useCallback(
    (key: string, value: string) => {
      document.documentElement.style.setProperty(key, value);
      if (mode === "dark") setDark((cur) => ({ ...cur, [key]: value }));
      else setLight((cur) => ({ ...cur, [key]: value }));
    },
    [mode],
  );

  const vars = mode === "dark" ? dark : light;
  return { vars, setVar, light, dark };
}
```

- [ ] **Step 2: Repoint `theme-studio.tsx`**

Remove these imports:
```ts
import { useResolvedTheme } from "@/hooks/use-theme";
import { useThemes } from "@/lib/themes/themes-context";
```
Add:
```ts
import { useThemeVars, type ThemeVars } from "./theme-studio-vars";
```
In the `ThemeStudio` component, replace:
```ts
  const { liveVars, setLiveVar, lightTheme, darkTheme } = useThemes();
```
with:
```ts
  const { vars, setVar, light, dark } = useThemeVars();
```
Then rename usages inside the component body: `liveVars` → `vars`,
`setLiveVar` → `setVar`. Replace the `<ThemeExport … />` call with:
```tsx
        {showExport && <ThemeExport light={light} dark={dark} />}
```
(Drop the `liveVars`/`lightTheme`/`darkTheme` props it used to receive.)

- [ ] **Step 3: Rewrite the `ThemeExport` sub-component**

Replace the whole `ThemeExport` function with:
```tsx
function ThemeExport({ light, dark }: { light: ThemeVars; dark: ThemeVars }) {
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    const block = (selector: string, map: ThemeVars) => {
      const keys = Object.keys(map);
      if (keys.length === 0) return "";
      const body = keys.map((k) => `  ${k}: ${map[k]};`).join("\n");
      return `${selector} {\n${body}\n}`;
    };
    const snippet = [block(":root", light), block(".dark", dark)]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard write can fail in some environments — swallow silently. */
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      data-theme-export
      onClick={handleExport}
    >
      {copied ? "Copied!" : "Export"}
    </Button>
  );
}
```
Update the JSDoc on `ThemeStudio` (the `@example` block) to drop the
`import { defaultTheme }` line — just `<ThemeProvider><ThemeStudio /></ThemeProvider>`.

- [ ] **Step 4: Update `theme-studio.stories.tsx`**

Remove `import { defaultTheme } from "@/lib/themes";`. Change the wrapping
decorator from `<ThemeProvider theme={defaultTheme}>` to `<ThemeProvider>`
(keep `ThemeProvider` imported from `../admin` / wherever it currently comes
from). The `Basic`, `NoExport`, `NoThemeToggle` exports keep their
`showExport`/`showThemeModeToggle` props.

- [ ] **Step 5: Load tokens in the browser test setup**

The specs seed from `getComputedStyle`, which needs the token CSS present. At
the **top** of `packages/shadmin/vitest.browser-setup.ts`, add:
```ts
import "./src/index.css";
```
(If the Tailwind pipeline makes this import fail in the browser provider, fall
back to injecting a `<style>` whose text is the `:root { … }` / `.dark { … }`
blocks copied from `src/index.css` — the goal is only that the semantic tokens
resolve on `document.documentElement` during tests.)

- [ ] **Step 6: Rewrite `theme-studio.spec.tsx`**

Replace the file with the version below — same coverage, minus the assertions
that depended on the provider writing the whole palette to inline style on a
mode flip (the new model writes inline style only on edit):

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, NoExport, NoThemeToggle } from "./theme-studio.stories";

describe("<ThemeStudio />", () => {
  it("renders one row per editable CSS variable", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("renders the export button by default", async () => {
    const screen = render(<Basic />);
    expect(screen.container.querySelector("[data-theme-export]")).toBeTruthy();
  });

  it("hides the export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    expect(screen.container.querySelector("[data-theme-export]")).toBeNull();
  });

  it("hides the theme mode toggle when showThemeModeToggle=false", async () => {
    const screen = render(<NoThemeToggle />);
    expect(
      screen.container.querySelector("[data-theme-mode-toggle]"),
    ).toBeNull();
  });

  it("toggles the .dark class via the mode toggle", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Dark" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("dark"))
      .toBe(true);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);
  });

  it("writes ColorInput edits to the document root inline style", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);

    const textInput = screen.container.querySelector<HTMLInputElement>(
      '[data-theme-var="--background"] input[type="text"]',
    );
    if (!textInput) throw new Error("text input for --background not found");

    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(textInput, "oklch(0.5 0 0)");
    textInput.dispatchEvent(new Event("input", { bubbles: true }));

    await expect
      .poll(() =>
        document.documentElement.style.getPropertyValue("--background"),
      )
      .toBe("oklch(0.5 0 0)");
  });

  it("opens an oklch picker popover when the swatch is clicked", async () => {
    const screen = render(<Basic />);

    await screen
      .getByRole("button", { name: "Open color picker for --background" })
      .click();

    await expect
      .poll(() => document.querySelector('[data-slot="color-picker"]'))
      .not.toBeNull();
    expect(
      document.querySelector('[data-slot="color-picker-pad"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 7: Run the spec**

Run: `cd packages/shadmin && pnpm test -- theme-studio`
Expected: all `<ThemeStudio />` tests PASS. (Browser provider cold-boots ~100s —
background it if preferred.)

- [ ] **Step 8: Typecheck**

Run: `cd packages/shadmin && pnpm typecheck`
Expected: PASS except the to-be-deleted story files (`themes.stories.tsx`,
`admin.stories.tsx`) — handled in Task 6.

- [ ] **Step 9: Commit**
```bash
git add packages/shadmin/src/components/extras/theme-studio.tsx \
        packages/shadmin/src/components/extras/theme-studio-vars.ts \
        packages/shadmin/src/components/extras/theme-studio.stories.tsx \
        packages/shadmin/src/components/extras/theme-studio.spec.tsx \
        packages/shadmin/vitest.browser-setup.ts
git commit -m "refactor(themes): repoint ThemeStudio to computed vars + CSS export"
```

---

### Task 6: Delete the TS palette system

Now that nothing imports the palettes except stories, remove them.

**Files:**
- Delete: `packages/shadmin/src/lib/themes/` (whole dir: `aurora-theme.ts`,
  `bw-theme.ts`, `default-theme.ts`, `default-theme.spec.ts`, `house-theme.ts`,
  `nano-theme.ts`, `radiant-theme.ts`, `theme-types.ts`, `themes-context.ts`,
  `index.ts`)
- Delete: `packages/shadmin/src/components/admin/themes.stories.tsx`
- Modify: `packages/shadmin/src/components/admin/admin.stories.tsx`
- Modify: `packages/shadmin/scripts/registry.config.mjs` (prune theme extraFiles)

- [ ] **Step 1: Fix `admin.stories.tsx`**

Remove `import { bwTheme } from "@/lib/themes/bw-theme";` and the
`theme={bwTheme}` prop on the `<Admin …>` in that story (render with the default
theme).

- [ ] **Step 2: Delete the palette files + story**
```bash
cd packages/shadmin
git rm -r src/lib/themes
git rm src/components/admin/themes.stories.tsx
```

- [ ] **Step 3: Prune `registry.config.mjs` admin `extraFiles`**

In the `admin` block's `extraFiles`, delete the 10 `src/lib/themes/*.ts`
entries:
```js
      { path: "src/lib/themes/aurora-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/bw-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/default-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/house-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/index.ts", type: "registry:lib" },
      { path: "src/lib/themes/nano-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/radiant-theme.ts", type: "registry:lib" },
      { path: "src/lib/themes/theme-context.ts", type: "registry:lib" },
      { path: "src/lib/themes/theme-types.ts", type: "registry:lib" },
      { path: "src/lib/themes/themes-context.ts", type: "registry:lib" },
```
Add (the relocated mode context) in their place:
```js
      { path: "src/lib/theme-context.ts", type: "registry:lib" },
```

- [ ] **Step 4: Verify nothing still references `lib/themes`**

Run:
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
grep -rn "lib/themes" packages/shadmin/src packages/shadmin/scripts apps --include="*.ts" --include="*.tsx" --include="*.mjs" | grep -v "/temp" | grep -v node_modules
```
Expected: only the **app.crm.tsx** hit (`shadmin/lib/themes`, fixed in Task 8).
No hits inside `packages/shadmin/src` or `scripts`.

- [ ] **Step 5: Typecheck + lint**

Run (parallel):
```bash
cd packages/shadmin && pnpm typecheck
cd /Users/rin/GitHub/shadcn-admin-kit && pnpm biome check ./packages/shadmin/src
```
Expected: package typecheck PASS; biome clean (apps not yet — app.crm fixed in
Task 8).

- [ ] **Step 6: Commit**
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
git add packages/shadmin
git commit -m "refactor(themes): delete TS palette system + themes story"
```

---

### Task 7: Registry — parser, admin cssVars, 5 theme items

**Files:**
- Create: `packages/shadmin/scripts/parse-css-vars.mjs`
- Create: `packages/shadmin/scripts/parse-css-vars.spec.mjs` (node test)
- Modify: `packages/shadmin/scripts/registry.config.mjs`
- Modify: `packages/shadmin/scripts/generate-registry.mjs`
- Regenerate: `packages/shadmin/registry.json`

- [ ] **Step 1: Write the failing parser test**

Create `packages/shadmin/scripts/parse-css-vars.spec.mjs`:
```js
import assert from "node:assert/strict";

import { parseCssVars } from "./parse-css-vars.mjs";

const css = `
/* a comment */
:root { --primary: oklch(0.2 0 0); --radius: 0.5rem; }
.dark { --primary: oklch(0.9 0 0); }
.theme-aurora { --primary: rebeccapurple; }
.theme-aurora.dark { --primary: hotpink; }
@utility glass { background: var(--glass-bg); }
`;

assert.deepEqual(parseCssVars(css, ":root"), {
  primary: "oklch(0.2 0 0)",
  radius: "0.5rem",
});
assert.deepEqual(parseCssVars(css, ".dark"), { primary: "oklch(0.9 0 0)" });
assert.deepEqual(parseCssVars(css, ".theme-aurora"), {
  primary: "rebeccapurple",
});
assert.deepEqual(parseCssVars(css, ".theme-aurora.dark"), {
  primary: "hotpink",
});
// @utility block holds no custom-property declarations → empty
assert.deepEqual(parseCssVars(css, "@utility glass"), {});

console.log("parse-css-vars OK");
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd packages/shadmin && node scripts/parse-css-vars.spec.mjs`
Expected: FAIL — `Cannot find module './parse-css-vars.mjs'`.

- [ ] **Step 3: Implement the parser**

Create `packages/shadmin/scripts/parse-css-vars.mjs`:
```js
// Minimal CSS custom-property extractor for the registry generator.
//
// Parses `--key: value;` declarations out of the rule whose selector list
// contains `selector` exactly. Handles only FLAT blocks (no nested braces),
// which is all our token/theme/aurora files contain. Keys are returned WITHOUT
// the leading `--`, matching the shadcn registry `cssVars` convention.

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * @param {string} css  Raw CSS text.
 * @param {string} selector  Exact selector, e.g. ":root", ".dark",
 *   ".theme-aurora", ".theme-aurora.dark".
 * @returns {Record<string, string>}
 */
export const parseCssVars = (css, selector) => {
  const text = stripComments(css);
  const out = {};
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let rule;
  while ((rule = ruleRe.exec(text)) !== null) {
    const selectors = rule[1].split(",").map((s) => s.trim());
    if (!selectors.includes(selector)) continue;
    const declRe = /--([\w-]+)\s*:\s*([^;]+);/g;
    let decl;
    while ((decl = declRe.exec(rule[2])) !== null) {
      out[decl[1]] = decl[2].trim();
    }
  }
  return out;
};
```

- [ ] **Step 4: Run the test, expect pass**

Run: `cd packages/shadmin && node scripts/parse-css-vars.spec.mjs`
Expected: `parse-css-vars OK`

- [ ] **Step 5: Extend `registry.config.mjs`**

(a) On the `admin` block object, add a field (next to `granularize`):
```js
    cssVarsFromFile: "src/index.css",
```
(b) At the end of the file, after the `blocks` array, add the theme config and
the hand-authored aurora utilities literal:
```js
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
```

- [ ] **Step 6: Extend `generate-registry.mjs`**

(a) Add imports near the top (with the existing config import):
```js
import { parseCssVars } from "./parse-css-vars.mjs";
import {
  AURORA_UTILITIES_CSS,
  blocks,
  registryMetadata,
  themes,
} from "./registry.config.mjs";
```
(replace the existing `import { blocks, registryMetadata } from "./registry.config.mjs";`).

(b) Inside `buildBlock`, just before `return item;`, attach cssVars when
configured:
```js
  if (block.cssVarsFromFile) {
    const cssText = readFileSync(join(repoRoot, block.cssVarsFromFile), "utf8");
    item.cssVars = {
      light: parseCssVars(cssText, ":root"),
      dark: parseCssVars(cssText, ".dark"),
    };
  }
```

(c) Add a `buildTheme` function above `main`:
```js
const buildTheme = (theme) => {
  const cssText = readFileSync(join(repoRoot, theme.cssFile), "utf8");
  const sel = `.theme-${theme.selector}`;
  const cssVars = {
    light: parseCssVars(cssText, sel),
    dark: parseCssVars(cssText, `${sel}.dark`),
  };

  if (theme.aurora) {
    const auroraText = readFileSync(
      join(repoRoot, "src/styles/aurora.css"),
      "utf8",
    );
    const rootVars = parseCssVars(auroraText, ":root"); // aurora + glass/orb (light)
    const darkVars = parseCssVars(auroraText, ".dark"); // glass/orb (dark)
    const { aurora, ...lightAdditive } = rootVars;
    cssVars.theme = { aurora };
    cssVars.light = { ...cssVars.light, ...lightAdditive };
    cssVars.dark = { ...cssVars.dark, ...darkVars };
  }

  const item = {
    name: theme.name,
    type: "registry:theme",
    title: theme.title,
    cssVars,
    files: [],
  };
  if (theme.description) item.description = theme.description;
  if (theme.aurora) item.css = AURORA_UTILITIES_CSS;
  return item;
};
```

(d) In `main`, after the `for (const block of blocks)` loop and before
`verifyFilesExist(items)`, add:
```js
  for (const theme of themes) {
    items.push(buildTheme(theme));
  }
```

- [ ] **Step 7: Regenerate the registry**

Run: `cd packages/shadmin && pnpm registry:generate`
Expected: writes `registry.json` with no errors.

- [ ] **Step 8: Assert the output shape**

Run:
```bash
cd packages/shadmin && node -e '
const r=require("./registry.json");
const admin=r.items.find(i=>i.name==="admin");
if(!admin.cssVars||!admin.cssVars.light.primary||!admin.cssVars.dark.primary)
  throw new Error("admin cssVars missing");
const t=r.items.filter(i=>i.type==="registry:theme");
if(t.length!==5) throw new Error("expected 5 theme items, got "+t.length);
const au=t.find(i=>i.name==="theme-aurora");
if(!au.cssVars.theme||!au.cssVars.theme.aurora) throw new Error("aurora gradient var missing");
if(!au.css||!au.css["@utility glass"]) throw new Error("aurora @utility css missing");
const bw=t.find(i=>i.name==="theme-bw");
if(!bw.cssVars.light.primary||bw.css) throw new Error("bw shape wrong");
console.log("registry OK:", t.map(i=>i.name).join(", "));
'
```
Expected: `registry OK: theme-aurora, theme-bw, theme-house, theme-nano, theme-radiant`

- [ ] **Step 9: Build the registry**

Run: `cd packages/shadmin && pnpm registry:build`
Expected: succeeds (writes `public/r/*.json`).

- [ ] **Step 10: Commit**
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
git add packages/shadmin/scripts packages/shadmin/registry.json packages/shadmin/public
git commit -m "feat(registry): emit admin cssVars + 5 registry:theme items from CSS"
```

---

### Task 8: Demo — runtime palette switcher (default aurora)

**Files:**
- Create: `apps/demo/src/use-theme-palette.ts`
- Create: `apps/demo/src/theme-palette-switcher.tsx`
- Modify: `apps/demo/src/index.css` (import the 5 palette files)
- Modify: `apps/demo/src/inspector-layout.tsx` (mount the switcher)
- Modify: `apps/demo/src/app.crm.tsx` (drop the palette import + prop)

- [ ] **Step 1: Import the palette CSS into the demo**

In `apps/demo/src/index.css`, below the existing line, add the 5 imports (order
matters — they must come after the package import so `.theme-*` wins the
source-order tie with `:root`):
```css
@import "../../../packages/shadmin/src/index.css";
@import "../../../packages/shadmin/src/styles/themes/aurora.css";
@import "../../../packages/shadmin/src/styles/themes/bw.css";
@import "../../../packages/shadmin/src/styles/themes/house.css";
@import "../../../packages/shadmin/src/styles/themes/nano.css";
@import "../../../packages/shadmin/src/styles/themes/radiant.css";
```

- [ ] **Step 2: Create the palette hook**

Create `apps/demo/src/use-theme-palette.ts`:
```ts
import { useEffect } from "react";
import { useStore } from "ra-core";

export const THEME_PALETTES = [
  { value: "default", label: "Default" },
  { value: "aurora", label: "Aurora" },
  { value: "bw", label: "Black & White" },
  { value: "house", label: "House" },
  { value: "nano", label: "Nano" },
  { value: "radiant", label: "Radiant" },
] as const;

export type ThemePalette = (typeof THEME_PALETTES)[number]["value"];

const CLASS_NAMES = THEME_PALETTES.filter((p) => p.value !== "default").map(
  (p) => `theme-${p.value}`,
);

const applyPalette = (palette: ThemePalette) => {
  const root = document.documentElement;
  root.classList.remove(...CLASS_NAMES);
  if (palette !== "default") root.classList.add(`theme-${palette}`);
};

/**
 * Demo-only runtime palette switcher. Persists the choice via ra-core
 * `useStore` and applies the matching `.theme-*` class to `<html>`. Defaults to
 * aurora so the demo showcases the aurora palette on first load.
 */
export const useThemePalette = (): [
  ThemePalette,
  (palette: ThemePalette) => void,
] => {
  const [palette, setPalette] = useStore<ThemePalette>(
    "demo.palette",
    "aurora",
  );
  useEffect(() => {
    applyPalette(palette);
  }, [palette]);
  return [palette, setPalette];
};
```

- [ ] **Step 3: Create the switcher component**

Create `apps/demo/src/theme-palette-switcher.tsx`:
```tsx
import { SwatchBookIcon } from "lucide-react";

import { Button } from "shadmin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "shadmin/components/ui/dropdown-menu";

import { THEME_PALETTES, useThemePalette } from "./use-theme-palette";

/**
 * Demo-only dropdown to switch the active CSS palette at runtime. Applies a
 * `.theme-*` class to `<html>`; the distributed package has no such layer.
 */
export const ThemePaletteSwitcher = () => {
  const [palette, setPalette] = useThemePalette();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme palette">
          <SwatchBookIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_PALETTES.map((p) => (
          <DropdownMenuItem key={p.value} onClick={() => setPalette(p.value)}>
            {p.label}
            {palette === p.value ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

- [ ] **Step 4: Mount the switcher in the layout**

In `apps/demo/src/inspector-layout.tsx`, import the switcher:
```tsx
import { ThemePaletteSwitcher } from "./theme-palette-switcher";
```
and render `<ThemePaletteSwitcher />` next to `<ThemeStudioButton />` /
`<LayoutBuilderButton />` in the header toolbar. (Mounting it here also applies
the default aurora palette on load, because the hook's effect runs when the
always-rendered header mounts. Confirm `InspectorLayout` is the layout used by
the demo's default app — `app.crm.tsx` uses it. If the default `SelectedApp` in
`apps/demo/src/app.tsx` is a different app with a different layout, also mount
`<ThemePaletteSwitcher />` there so aurora shows on first load.)

- [ ] **Step 5: Drop the palette prop from the CRM app**

In `apps/demo/src/app.crm.tsx`:
- delete `import { auroraTheme } from "shadmin/lib/themes";`
- delete the `theme={auroraTheme}` line from the `<Admin …>` props.

- [ ] **Step 6: Verify no `lib/themes` references remain anywhere**

Run:
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
grep -rn "lib/themes" apps packages/shadmin/src packages/shadmin/scripts --include="*.ts" --include="*.tsx" --include="*.mjs" | grep -v "/temp" | grep -v node_modules
```
Expected: no output.

- [ ] **Step 7: Typecheck + lint the demo**

Run (parallel):
```bash
cd apps/demo && pnpm typecheck
cd /Users/rin/GitHub/shadcn-admin-kit && pnpm biome check ./apps/demo
```
Expected: both clean.

- [ ] **Step 8: Smoke-test in the browser**

Start the demo dev server (preview tooling). Verify, with proof
(screenshot/console):
1. First load renders the **aurora** palette (default).
2. The palette dropdown switches the look live in both light and dark mode
   (pick `bw` → monochrome; `default` → neutral shadcn).
3. ThemeStudio opens, editing `--primary` updates the UI live, and Export copies
   a `:root { … }` CSS snippet (no `AdminTheme` TS).

- [ ] **Step 9: Commit**
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
git add apps/demo
git commit -m "feat(demo): runtime palette switcher (default aurora), drop CRM theme prop"
```

---

### Task 9: Final verification battery

- [ ] **Step 1: Run the full battery (parallel)**

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
pnpm biome check ./packages/shadmin/src ./apps        # lint/format
cd packages/shadmin && pnpm typecheck                 # package types
cd apps/demo && pnpm typecheck                         # demo types
```
Expected: all clean. (Per project memory, the Leaflet build has pre-existing
typecheck failures unrelated to this work — confirm any failure exists on a
clean `main` before attributing it here.)

- [ ] **Step 2: Registry round-trip**

```bash
cd packages/shadmin && pnpm registry:generate && pnpm registry:build && bash scripts/test-registry.sh
```
Expected: generate + build succeed; `test-registry.sh` installs the admin block
into its scratch consumer and compiles. (The script asserts standalone
compilation; it does not need the theme items, but they must not break generate.)

- [ ] **Step 3: Package test suite (theme-affected specs)**

```bash
cd packages/shadmin && pnpm test -- theme-studio use-theme
```
Expected: PASS. (Run the full `pnpm test` once if time allows — browser provider
is slow; background it.)

- [ ] **Step 4: Final commit (if anything regenerated)**
```bash
cd /Users/rin/GitHub/shadcn-admin-kit
git add -A
git commit -m "chore(themes): final verification battery" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:**
- Two-layer split (keep mode / remove palette) → Tasks 2,3,4 (keep mode + strip palette).
- Scoped-class CSS source of truth → Task 1.
- Registry: admin cssVars from index.css + 5 theme items + aurora css → Task 7.
- ThemeStudio repointed → Task 5.
- Deletes (11 lib/themes + themes.stories) + relocate theme-context → Tasks 2, 6.
- Demo switcher (default aurora) + drop crm prop → Task 8.
- Out of scope (website/docs, temp dirs) → untouched (no task).
- Verification → Task 9.

**Placeholder scan:** No TBD/TODO. Mechanical CSS ports (Task 1 Step 2) give a full worked example + exact transform + verified by Step 3 assertion. All code steps contain complete code.

**Type/name consistency:** `useThemeVars` returns `{vars,setVar,light,dark}` (Task 5 hook) and is consumed with those exact names in `theme-studio.tsx` (Task 5 Steps 2–3). `parseCssVars(css, selector)` signature is identical in test (Task 7 Step 1), impl (Step 3), and callers (Step 6). `THEME_PALETTES`/`useThemePalette`/`ThemePalette` consistent across demo files (Task 8). Registry field `cssVarsFromFile` defined in config (Task 7 Step 5a) and read in generator (Step 6b).
