# Website Aurora Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `apps/website` into the "Aurora" aesthetic — a vivid magenta→violet→cyan gradient over a liquid-glass material, in light + dark — replacing the inherited parent template.

**Architecture:** Aurora tokens + glass `@utility` classes authored website-local in `index.css` (move-ready var names, relocated to a shared package file in a later phase). A small set of reusable React primitives (`apps/website/src/components/aurora/`) compose those tokens; every section is rewritten to use them. Motion via `framer-motion` (`whileInView` reveals, magnetic buttons, fluid nav). Light/dark via a `.dark` class on `<html>` set by a no-flash init script (defaults to dark) and flipped by a `ThemeToggle`.

**Tech Stack:** React 19, Vite, Tailwind CSS v4 (CSS-first `@theme`/`@utility`), framer-motion, Geist (Google Fonts), Tabler-free (lucide-react already present).

**Design spec:** `docs/superpowers/specs/2026-06-15-website-aurora-redesign-design.md` (read it — this plan is the HOW, the spec is the WHY).

**Conventions for every task:**
- Work in `apps/website`. Package name is `shadmin-website`. Dev server: `pnpm --filter shadmin-website dev` (vite, port 5174). Typecheck: `pnpm --filter shadmin-website typecheck` (`tsc --noEmit -p tsconfig.app.json`).
- `@/` resolves to `apps/website/src`.
- **Verification per task** = typecheck green + Preview-MCP visual check. "Visual check" means: ensure dev server running (`preview_start` if needed), `preview_screenshot`, toggle theme + `preview_screenshot` again, and where layout matters `preview_resize` to 390px width. Confirm no `preview_console_logs` errors.
- Commit after each task. Commit messages in normal English.
- Do NOT touch `packages/shadmin`, `apps/docs`, or `apps/demo` — those are later phases.

---

## File structure

**New — primitives (`apps/website/src/components/aurora/`):**
- `AuroraBackground.tsx` — absolutely-positioned blurred orb layer for a section background.
- `GlassPanel.tsx` — glass surface; `bezel` prop wraps content in the double-bezel (outer shell + inner core).
- `GradientText.tsx` — span with the aurora gradient clipped to text.
- `Eyebrow.tsx` — wide-tracked glass pill label.
- `MagneticButton.tsx` — pointer-following button with nested icon-circle (button-in-button).
- `Reveal.tsx` — `whileInView` fade-up wrapper + `RevealItem` for staggered children.
- `ThemeToggle.tsx` — sun/moon glass toggle.

**New — libs:**
- `apps/website/src/lib/motion.ts` — framer variants + easing.
- `apps/website/src/lib/use-theme.ts` — theme hook (only if the package hook doesn't fit; see Task 2).

**Modified:**
- `apps/website/src/index.css` — aurora tokens, glass `@utility`, `.dark` canvas override, `--font-sans: Geist`.
- `apps/website/index.html` — drop Inter from font link; add no-flash theme-init script.
- `apps/website/package.json` — add `framer-motion`.
- `apps/website/src/App.tsx` — remove `Users`, wrap nothing extra (theme is class-based).
- `apps/website/src/components/Header.tsx` — rewrite as fluid island nav.
- Section components: `Hero, Technos, Features, AdvancedCapabilities, Backends, Open, Deploy, Why, ByDevelopers, Pricing, CallToAction, Footer` (+ `Container`, `NavLink`, `Logo` as needed).

**Deleted:**
- `apps/website/src/components/Users.tsx`

---

## Task 1: Foundation — deps, tokens, glass utilities, fonts, theme init

**Files:**
- Modify: `apps/website/package.json`
- Modify: `apps/website/src/index.css`
- Modify: `apps/website/index.html`

- [ ] **Step 1: Add framer-motion**

Run: `pnpm --filter shadmin-website add framer-motion`
Expected: framer-motion appears in `apps/website/package.json` dependencies; lockfile updates.

- [ ] **Step 2: Add aurora tokens + glass utilities to `index.css`**

Append after the existing `.dark { … }` block (do not remove existing shadcn tokens). Add aurora vars to `:root` and `.dark`, override the dark canvas, set Geist, and define the utilities:

```css
@theme {
  --font-sans: Geist, sans-serif;
}

:root {
  /* aurora signature gradient */
  --aurora: linear-gradient(100deg, #d4537e, #7f77dd 52%, #1d9e75);
  /* glass material — light */
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.85);
  --glass-blur: 16px;
  --glass-shadow: 0 16px 40px rgba(31, 38, 80, 0.1);
  --glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  /* aurora orbs — light */
  --orb-1: rgba(212, 83, 126, 0.30);
  --orb-2: rgba(127, 119, 221, 0.32);
  --orb-3: rgba(29, 158, 117, 0.24);
  --orb-4: rgba(55, 138, 221, 0.22);
  /* soft cool-white marketing canvas (light) */
  --background: oklch(0.985 0.004 290);
  --foreground: oklch(0.16 0.02 285);
}

.dark {
  /* glass material — dark */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.09);
  --glass-blur: 14px;
  --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  --glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  /* aurora orbs — dark */
  --orb-1: rgba(212, 83, 126, 0.55);
  --orb-2: rgba(127, 119, 221, 0.55);
  --orb-3: rgba(29, 158, 117, 0.42);
  --orb-4: rgba(55, 138, 221, 0.40);
  /* deep OLED-ish marketing canvas (dark) */
  --background: oklch(0.06 0.012 290);
  --foreground: oklch(0.97 0.01 290);
}

@utility glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow), var(--glass-inset);
}

@utility bezel {
  border-radius: 2rem;
  padding: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
}

@utility text-aurora {
  background: var(--aurora);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@utility bg-aurora {
  background: var(--aurora);
}
```

- [ ] **Step 3: Drop Inter from the font link in `index.html`**

Replace the Google Fonts `<link href="…">` so it requests Geist only:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 4: Add the no-flash theme-init script (defaults to dark)**

In `index.html` `<head>`, BEFORE the stylesheet links, add:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("theme");
      document.documentElement.classList.toggle("dark", t !== "light");
    } catch (e) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

- [ ] **Step 5: Verify**

Run: `pnpm --filter shadmin-website typecheck`
Expected: PASS (no TS errors).
Visual check: `preview_start` the dev server; `preview_screenshot`. Expected: page renders on a near-black canvas (dark default), body text in Geist. No console errors. (Sections still look like the old template — that's fine; only the canvas/font changed.)

- [ ] **Step 6: Commit**

```bash
git add apps/website/package.json apps/website/src/index.css apps/website/index.html pnpm-lock.yaml
git commit -m "feat(website): aurora design tokens, glass utilities, Geist font, dark-default theme init"
```

---

## Task 2: Theme hook + ThemeToggle primitive

**Files:**
- Read first: `packages/shadmin/src/hooks/use-theme.ts`
- Create (conditional): `apps/website/src/lib/use-theme.ts`
- Create: `apps/website/src/components/aurora/ThemeToggle.tsx`

- [ ] **Step 1: Decide hook source**

Read `packages/shadmin/src/hooks/use-theme.ts`. If it exposes a simple `html.dark` + `localStorage` toggle the website can import without pulling in the package's broader theme-preset system, reuse it (import via the demo-style relative path or an alias) and SKIP Step 2. Otherwise create the local hook in Step 2. Record the decision in the commit message.

- [ ] **Step 2: Create the local theme hook (if not reusing)**

```tsx
// apps/website/src/lib/use-theme.ts
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, setTheme, toggle };
}
```

- [ ] **Step 3: Create ThemeToggle**

```tsx
// apps/website/src/components/aurora/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/use-theme"; // or the package hook per Step 1

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="glass inline-flex size-9 items-center justify-center rounded-full transition-transform active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
```

- [ ] **Step 4: Temporarily mount it for verification**

Render `<ThemeToggle />` once (e.g. top of `App.tsx` inside a fixed-position wrapper) ONLY to verify; it will be moved into the nav in Task 5. Acceptable to leave it in `App.tsx` until Task 5 wires the real nav.

- [ ] **Step 5: Verify**

Run: `pnpm --filter shadmin-website typecheck` → PASS.
Visual check: click the toggle (`preview_click`), `preview_screenshot` before/after. Expected: canvas flips dark↔light; reload preserves the choice (localStorage). No console errors.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/lib/use-theme.ts apps/website/src/components/aurora/ThemeToggle.tsx apps/website/src/App.tsx
git commit -m "feat(website): theme hook + ThemeToggle (sun/moon glass pill)"
```

---

## Task 3: Motion library + Reveal + MagneticButton

**Files:**
- Create: `apps/website/src/lib/motion.ts`
- Create: `apps/website/src/components/aurora/Reveal.tsx`
- Create: `apps/website/src/components/aurora/MagneticButton.tsx`

- [ ] **Step 1: Motion variants**

```ts
// apps/website/src/lib/motion.ts
import type { Variants } from "framer-motion";

export const EASE_FLUID = [0.32, 0.72, 0, 1] as const;

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_FLUID },
  },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
```

- [ ] **Step 2: Reveal + RevealItem**

```tsx
// apps/website/src/components/aurora/Reveal.tsx
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealUp, staggerParent } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  stagger?: boolean;
  className?: string;
}

export function Reveal({ children, stagger = false, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerParent : revealUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={revealUp}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: MagneticButton**

Renders an `<a>` (links) with pointer-following translate, `active:scale`, and an optional nested icon-circle (button-in-button). `variant` controls aurora-fill vs ghost.

```tsx
// apps/website/src/components/aurora/MagneticButton.tsx
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: "aurora" | "ghost";
  icon?: boolean;
  external?: boolean;
  className?: string;
}

export function MagneticButton({
  href,
  children,
  variant = "aurora",
  icon = true,
  external = false,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * 0.25,
      y: (e.clientY - (r.top + r.height / 2)) * 0.25,
    });
  };
  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.3 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full pl-5 pr-2 py-2 text-sm font-medium",
        variant === "aurora"
          ? "bg-aurora text-white"
          : "glass text-foreground",
        className,
      )}
    >
      {children}
      {icon && (
        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="size-4" />
        </span>
      )}
    </motion.a>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm --filter shadmin-website typecheck` → PASS.
(No visual yet — exercised in Task 5/6.)

- [ ] **Step 5: Commit**

```bash
git add apps/website/src/lib/motion.ts apps/website/src/components/aurora/Reveal.tsx apps/website/src/components/aurora/MagneticButton.tsx
git commit -m "feat(website): motion variants, Reveal/RevealItem, MagneticButton primitives"
```

---

## Task 4: Visual primitives — AuroraBackground, GlassPanel, GradientText, Eyebrow

**Files:**
- Create: `apps/website/src/components/aurora/AuroraBackground.tsx`
- Create: `apps/website/src/components/aurora/GlassPanel.tsx`
- Create: `apps/website/src/components/aurora/GradientText.tsx`
- Create: `apps/website/src/components/aurora/Eyebrow.tsx`

- [ ] **Step 1: AuroraBackground**

Renders 4 blurred orbs using `--orb-1..4`, absolutely positioned, behind content, `pointer-events-none`, `aria-hidden`. Accepts `className` for per-section overrides.

```tsx
// apps/website/src/components/aurora/AuroraBackground.tsx
import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  const orbs = [
    "left-[-60px] top-[-90px] size-[300px]",
    "right-[40px] top-[-50px] size-[260px]",
    "right-[-40px] bottom-[-110px] size-[280px]",
    "left-[20px] bottom-[-90px] size-[220px]",
  ];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {orbs.map((pos, i) => (
        <div
          key={pos}
          className={cn("absolute rounded-full blur-[58px]", pos)}
          style={{ background: `var(--orb-${i + 1})` }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: GlassPanel**

A glass surface. With `bezel`, renders outer shell + inner core for concentric curves.

```tsx
// apps/website/src/components/aurora/GlassPanel.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  bezel?: boolean;
  className?: string;
}

export function GlassPanel({ children, bezel = false, className }: GlassPanelProps) {
  if (bezel) {
    return (
      <div className="bezel">
        <div className={cn("glass rounded-[calc(2rem-0.5rem)]", className)}>
          {children}
        </div>
      </div>
    );
  }
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}
```

- [ ] **Step 3: GradientText**

```tsx
// apps/website/src/components/aurora/GradientText.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-aurora", className)}>{children}</span>;
}
```

- [ ] **Step 4: Eyebrow**

```tsx
// apps/website/src/components/aurora/Eyebrow.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "glass inline-block rounded-full px-3 py-1.5 text-[11px] tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm --filter shadmin-website typecheck` → PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/components/aurora/AuroraBackground.tsx apps/website/src/components/aurora/GlassPanel.tsx apps/website/src/components/aurora/GradientText.tsx apps/website/src/components/aurora/Eyebrow.tsx
git commit -m "feat(website): AuroraBackground, GlassPanel (double-bezel), GradientText, Eyebrow"
```

---

## Task 5: Header → Fluid island nav

**Files:**
- Modify: `apps/website/src/components/Header.tsx`
- Modify (revert temp mount): `apps/website/src/App.tsx`

**Intent:** Replace the edge-to-edge header with a floating glass island pill (`mt-6 mx-auto w-max rounded-full glass-strong`, centered). Contents: gradient logo-dot + "shadmin", links (Features, Docs at `https://shadmin.turtlesocks.dev/docs/install`, Demo at `https://shadmin.turtlesocks.dev/demo`), `<ThemeToggle />`, and a magnetic gradient "Star on GitHub" CTA (`https://github.com/TurtIeSocks/shadmin`, external). Remove the leftover dropdown cruft from the old header.

**Mobile (`<md`):** hamburger button that morphs to an X (two `<span>` bars, `rotate-45`/`-rotate-45` + translate, transition with `EASE_FLUID`); on open, a full-screen overlay (`fixed inset-0 backdrop-blur-2xl bg-background/80`) with the links revealed staggered (use `Reveal stagger` + `RevealItem`, or framer staggered list). Include `<ThemeToggle />` in the overlay. Close on link click / Escape.

- [ ] **Step 1:** Rewrite `Header.tsx` per the intent above, composing `ThemeToggle`, `MagneticButton`, and the existing `Logo`. Keep desktop + mobile variants.
- [ ] **Step 2:** Remove the temporary `<ThemeToggle />` mount added to `App.tsx` in Task 2.
- [ ] **Step 3: Verify** — typecheck PASS. Visual: `preview_screenshot` desktop (nav floats as a pill, not glued to top). `preview_resize` 390px → open the menu (`preview_click`), `preview_screenshot` (full-screen blur overlay, staggered links, hamburger shows X). Toggle theme in both. No console errors.
- [ ] **Step 4: Commit**

```bash
git add apps/website/src/components/Header.tsx apps/website/src/App.tsx
git commit -m "feat(website): fluid island nav with theme toggle, magnetic CTA, mobile morph overlay"
```

---

## Task 6: Hero

**Files:**
- Modify: `apps/website/src/components/Hero.tsx`

**Intent:** Wrap the section in `relative isolate` with `<AuroraBackground />` behind. Center column: `<Eyebrow>Open source · shadcn registry</Eyebrow>`, a large display headline (`text-5xl md:text-7xl font-bold tracking-[-0.02em]`) with a `<GradientText>` phrase, a muted sub, then two `MagneticButton`s ("Get started" → docs/install, aurora; "Live demo" → /demo, ghost, external). Below, keep the real product screenshot (`hero-screenshot.jpeg`) and `HotspotSvg` but frame them in `<GlassPanel bezel>`. Macro-whitespace: `py-24 md:py-32`. Wrap content groups in `<Reveal>`.

> Headline copy is a placeholder from the spec — use `Build admin panels that <GradientText>don't look like admin panels.</GradientText>` unless the user has supplied final copy. Keep the sub: "Production-ready shadcn blocks for internal tools, dashboards, B2B apps, and admin panels with React."

- [ ] **Step 1:** Rewrite `Hero.tsx` per intent.
- [ ] **Step 2: Verify** — typecheck PASS. Visual: `preview_screenshot` both themes; `preview_resize` 390px (headline scales, buttons stack, screenshot fits). Orbs visible behind glass. No console errors.
- [ ] **Step 3: Commit**

```bash
git add apps/website/src/components/Hero.tsx
git commit -m "feat(website): aurora hero — gradient headline, magnetic CTAs, bezel-framed screenshot"
```

---

## Task 7: Technos

**Files:** Modify `apps/website/src/components/Technos.tsx`

**Intent:** Heading "Built on tools you trust" (`GradientText` on a word). The 8 tech logos sit in a `GlassPanel` row/grid; logos render muted (`opacity-60 grayscale`) and animate to full color on hover (`hover:opacity-100 hover:grayscale-0 transition`). Wrap in `<Reveal stagger>` with `RevealItem` per logo. Keep all 8 logos + their links.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; hover one logo (`preview_eval` hover or just confirm static styles). No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora technos — glass logo row, mono→color hover"`

---

## Task 8: Features (bento)

**Files:** Modify `apps/website/src/components/Features.tsx`

**Intent:** Convert the 8 feature cards into an **asymmetric bento** grid (`grid md:grid-cols-3` with a couple of `md:col-span-2`/`md:row-span-2` emphasis cards; collapses to `grid-cols-1` below `md`). Each card is a `GlassPanel` (use `bezel` on the 1–2 hero cards), with a thin lucide icon tinted via `text-aurora` (or an aurora-filled icon chip), title, copy. Hover lift (`hover:-translate-y-1 transition`). Wrap grid in `<Reveal stagger>`, cards as `RevealItem`. Keep all 8 feature contents.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; `preview_resize` 390px (single column). No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora features — asymmetric bento glass grid"`

---

## Task 9: AdvancedCapabilities

**Files:** Modify `apps/website/src/components/AdvancedCapabilities.tsx`

**Intent:** Editorial split — copy column left (heading + the 8 checkmark items with aurora-tinted check icons + the existing CTA to `docs/install` as a `MagneticButton`), `GlassPanel bezel`-framed screenshot right. Below `md`, stack (copy then screenshot). Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; `preview_resize` 390px. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora advanced-capabilities — editorial split, bezel screenshot"`

---

## Task 10: Backends (honest count)

**Files:** Modify `apps/website/src/components/Backends.tsx`

**Intent:** Backend logos (Supabase, Appwrite, Firebase, Strapi, Hasura) in glass tiles; schema diagram (`dataProvider-schema.svg`) in a `GlassPanel bezel`. CTA to the data-providers doc as a `MagneticButton`. **Content fix:** replace the unverified "+ 40 more" badge with **"Works with any REST or GraphQL API"** (no invented count). Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent; remove the "+40 more" claim.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; grep the file to confirm no "40 more" string remains. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora backends — glass tiles; honest 'any REST/GraphQL' framing"`

---

## Task 11: Open (real stats)

**Files:** Modify `apps/website/src/components/Open.tsx`

**Intent:** 3 glass stat tiles with `GradientText` numbers. **Content fix:** replace the unverified stats with verifiable ones from `registry.json`:
- **165** — components
- **11** — blocks
- **100%** — open source (MIT)

(If unsure, re-derive: `node -e 'const r=require("./packages/shadmin/registry.json");const t={};r.items.forEach(i=>t[i.type]=(t[i.type]||0)+1);console.log(t)'` → `registry:component` = 165, `registry:block` = 11.) Wrap in `<Reveal stagger>`.

- [ ] **Step 1:** Rewrite per intent with the real numbers.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; confirm numbers read 165 / 11 / 100%. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora open section — real registry stats (165 components, 11 blocks)"`

---

## Task 12: Deploy (real snippet)

**Files:** Modify `apps/website/src/components/Deploy.tsx`

**Intent:** Hosting logos (Vercel, Netlify, GitHub Pages, Cloudflare) in glass tiles. **Content fix:** replace the fake fictional terminal output with a real, clearly-illustrative command in a `GlassPanel` "code card":

```
npx shadcn@latest add https://shadmin.turtlesocks.dev/r/admin.json
```

(Confirm the exact registry URL/command against `apps/docs/src/content/docs/install*`; use that canonical form if it differs.) Optionally a second line showing `pnpm build` — but no fabricated success spam. Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent; remove the fake terminal fiction.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; confirm the command shown is the real one. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora deploy — real install snippet, glass hosting tiles"`

---

## Task 13: Why (strip marmelab)

**Files:** Modify `apps/website/src/components/Why.tsx`

**Intent:** 6 value cards as `GlassPanel`s with aurora-tinted icons. **Content fix:** remove the `react-admin`/`marmelab.com` `<a>` links and the "trusted expertise by marmelab maintainers" crediting. Reframe the affected card copy to shadmin/OSS terms; the only allowed reference to the foundation is a neutral factual line, e.g. "Built on the battle-tested ra-core foundation." (no marketing association, no marmelab link). Wrap in `<Reveal stagger>`.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `grep -niE 'marmelab' apps/website/src/components/Why.tsx` → no matches; `preview_screenshot` both themes. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora why section — glass cards, strip marmelab crediting/links"`

---

## Task 14: ByDevelopers

**Files:** Modify `apps/website/src/components/ByDevelopers.tsx`

**Intent:** Editorial — heading (`GradientText` accent) + the VSCode screenshot in a `GlassPanel bezel`. Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; `preview_resize` 390px. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora by-developers — bezel-framed editor shot"`

---

## Task 15: Pricing (strip marmelab)

**Files:** Modify `apps/website/src/components/Pricing.tsx`

**Intent:** Single free-tier card as a `GlassPanel bezel` with an aurora gradient accent (e.g. gradient top border or `GradientText` price). **Content fix:** remove the "We already make a living with marmelab.com/react-admin" line (and its link). Replace with an honest sustainability line: "Free and open source under the MIT license — no tiers, no seats, no catch." Keep the "$0" / free framing. Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `grep -niE 'marmelab' apps/website/src/components/Pricing.tsx` → no matches; `preview_screenshot` both themes. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora pricing — glass free-tier card, strip marmelab revenue line"`

---

## Task 16: Cut Users + wire App.tsx

**Files:**
- Delete: `apps/website/src/components/Users.tsx`
- Modify: `apps/website/src/App.tsx`

- [ ] **Step 1:** `git rm apps/website/src/components/Users.tsx`.
- [ ] **Step 2:** In `App.tsx` remove the `Users` import and its `<Users />` element. Keep the existing section order otherwise.
- [ ] **Step 3: Verify** — typecheck PASS (no dangling import); `preview_screenshot` full page scroll — the fake-logo wall is gone, no layout gap/broken section. No console errors.
- [ ] **Step 4: Commit**

```bash
git add apps/website/src/App.tsx
git rm apps/website/src/components/Users.tsx
git commit -m "feat(website): cut the false-association Fortune-500 logo wall"
```

---

## Task 17: CallToAction

**Files:** Modify `apps/website/src/components/CallToAction.tsx`

**Intent:** The gradient showpiece — a full-width band using `bg-aurora` (or a large aurora glow) with a big headline, sub, and a magnetic CTA ("Get started" → docs). Ensure text contrast on the gradient (white text). Generous `py-24 md:py-32`. Wrap in `<Reveal>`.

- [ ] **Step 1:** Rewrite per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes; `preview_resize` 390px. Contrast check: headline readable on the gradient. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora call-to-action — gradient showpiece band"`

---

## Task 18: Footer

**Files:** Modify `apps/website/src/components/Footer.tsx`

**Intent:** Glass footer (`glass` top divider or panel), gradient logo-dot + "shadmin", links (GitHub, Docs, Demo). Keep the existing "© 2026 Shadmin. All rights reserved." It was already cleaned — only restyle to the glass/aurora language and confirm dark/light legibility.

- [ ] **Step 1:** Restyle per intent.
- [ ] **Step 2: Verify** — typecheck PASS; `preview_screenshot` both themes. No console errors.
- [ ] **Step 3: Commit** — `git commit -m "feat(website): aurora footer — glass treatment"`

---

## Task 19: Final battery + full build

**Files:** none (verification + any fixes surfaced).

- [ ] **Step 1: Typecheck + build the website**

Run: `pnpm --filter shadmin-website typecheck && pnpm --filter shadmin-website build`
Expected: both PASS (tsc clean, vite build emits `dist/`).

- [ ] **Step 2: Full visual sweep**

Visual: scroll the whole page top→bottom in BOTH themes (`preview_screenshot` each major section), and at 390px width. Confirm: orbs/glass render, gradient headline + CTA, nav floats + mobile overlay works, no fake logos, honest stats (165/11), no marmelab strings visible, no layout breakage, no `preview_console_logs` errors.

- [ ] **Step 3: Residual marmelab/fake-content scan**

Run: `grep -rniE 'marmelab|atomic-crm|fortune|40 more' apps/website/src`
Expected: no matches (ra-core foundation mention, if present, is the only allowed neutral reference and contains no marmelab link).

- [ ] **Step 4: Full monorepo assembly (CI parity)**

Run: `make build`
Expected: green — website + docs + demo + registry assemble into `./public`. (This is the deploy path; confirm the website redesign didn't break the assembled build.)

- [ ] **Step 5: Commit (if any fixes were made)**

```bash
git add -A
git commit -m "chore(website): final aurora redesign battery — typecheck, build, full-site visual + assembly verified"
```

---

## Self-review (completed by plan author)

**Spec coverage:** themes/toggle (T1,T2) · tokens+glass+move-ready names (T1) · Geist/drop-Inter (T1) · motion system (T3) · all 7 primitives (T2,T3,T4) · fluid nav + mobile morph (T5) · all 12 surviving sections (T6–T15,T17,T18) · cut Users (T16) · honest stats 165/11 (T11) · honest backends (T10) · real deploy snippet (T12) · strip marmelab Why/Pricing (T13,T15) · build+make-build gate (T19). No spec requirement left unmapped.

**Placeholder scan:** headline copy is the only placeholder and is explicitly flagged as spec-derived/confirmable (T6). No "TBD/handle edge cases/similar to Task N". Contracts carry full code; sections carry exact files + composition + exact content fixes + exact verify commands.

**Type consistency:** `useTheme()` returns `{ theme, setTheme, toggle }` (T2) used by `ThemeToggle` (T2). `revealUp`/`staggerParent`/`EASE_FLUID` (T3) used by `Reveal`/`MagneticButton` (T3). Primitive prop names (`bezel`, `stagger`, `variant`, `icon`, `external`) consistent across definitions and section usage. Utilities `glass`/`bezel`/`text-aurora`/`bg-aurora` defined in T1, referenced throughout.
