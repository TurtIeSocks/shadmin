# Website Aurora Redesign — Design Spec

- **Date:** 2026-06-15
- **Scope:** `apps/website` only (this phase). Sets the design language for a later rollout to docs, the shadmin components, and the demo.
- **Status:** approved design, pending implementation plan.

## 1. Context & goal

shadmin split from marmelab's react-admin / shadcn-admin-kit. The marketing site (`apps/website`) still wears the parent's stock shadcn template — centered hero + screenshot, logo wall, feature grids, pricing, testimonials. It reads as "a template with nice fonts."

**Goal:** redesign `apps/website` into a distinctive, high-end **Aurora** aesthetic — a vivid magenta→violet→cyan gradient over a **liquid-glass** material — that visibly breaks from the parent and establishes the design language we will later roll out (in order) to the **docs**, the **shadmin components**, and the **demo**.

Design skills applied:
- **high-end-visual-design** — Awwwards-tier: variance engine, double-bezel ("Doppelrand") nesting, button-in-button CTAs, motion choreography, macro-whitespace.
- **tailwind-design-system** — Tailwind v4 CSS-first, OKLCH tokens, `@custom-variant dark`, `@utility`.
- **liquid-glass-design** — iOS-26 Liquid Glass, adapted from SwiftUI to CSS `backdrop-blur` + layered translucency.

## 2. Decisions (locked)

| Axis | Choice |
|---|---|
| Vibe / canvas | **Aurora** — vivid magenta→violet→cyan mesh on dark; bright frosted canvas on light |
| Scope (this phase) | **Whole site**, all sections |
| Theme | **Light + dark**, fluid-island sun/moon toggle |
| Typography | **Geist** for display + body (drops Inter, which the high-end skill bans anyway) |
| Signature gradient | `linear-gradient(100deg, #d4537e, #7f77dd 52%, #1d9e75)` |
| Motion | **Full** choreography via `framer-motion` |
| Users / logo-wall section | **Cut entirely** (false-association liability — those are react-admin's customers) |
| CSS location (this phase) | **website-local**, authored move-ready; relocated to shared `aurora.css` in a later phase |
| React primitives | **website-local** now; promote reusable ones to `packages/shadmin` later |

## 3. Design language

### 3.1 Themes
Dark Aurora is the default. Light Aurora is the bright frosted variant (gradient retained as headline + accent). A fluid-island **sun/moon toggle** sits in the nav. Both themes are pure CSS-custom-prop swaps under `.dark`, so each section is authored once and themes for free.

### 3.2 Tokens (move-ready names — authored website-local this phase)
Authored in `apps/website/src/index.css` using the **final variable names** we intend to keep in the shared file, and **var-based, not hardcoded**, so the later move to `packages/shadmin/src/styles/aurora.css` is a cut/paste + one `@import` with zero renames.

- `--aurora: linear-gradient(100deg, #d4537e, #7f77dd 52%, #1d9e75)` — signature gradient (gradient text, primary CTA fill, logo dot, focus glow).
- `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-shadow`, `--glass-inset` — glass material params, per theme.
- `--orb-1` … `--orb-4` — aurora orb colors, per theme.
- `--font-sans: Geist` (display + body).
- **Not touched this phase:** existing shadcn semantic tokens (`--primary`, `--background`, `--card`, …). Remapping those is the components-phase contract; touching them now would bleed into demo/components prematurely.

Per-section orb **positions** are true one-offs — hardcoded in each section, not tokenized.

### 3.3 Glass material
Reusable Tailwind v4 `@utility` classes (authored once, not copy-pasted across 12 sections):
- `.glass` — standard panel. Dark: `bg rgba(255,255,255,.05)` + `border rgba(255,255,255,.09)` + `blur(14px)` + `inset 0 1px 0 rgba(255,255,255,.12)`. Light: `bg rgba(255,255,255,.6)` + white border + `blur(16px)` + soft ambient shadow.
- `.glass-strong` — higher-opacity variant for nav / floating elements.
- `.bezel` — outer shell (`rounded-[2rem] p-2`, glass) wrapping an inner core (`rounded-[calc(2rem-0.5rem)]`) for concentric "double-bezel" curves on every major card and framed screenshot.

### 3.4 Typography
Geist throughout. Display weights 600/700, `tracking-[-0.02em]`, scale `text-6xl`→`text-8xl`. Eyebrow = wide-tracked pill (`text-[11px] tracking-[0.16em]`, glass). Body Geist 400, generous leading.

### 3.5 Motion (`framer-motion`)
- **Reveal** — `whileInView` heavy fade-up + blur→sharp (`y:40, filter:blur(8px), opacity:0` → settled), `cubic-bezier(.32,.72,0,1)`, ~800ms, `viewport={{ once: true }}`, staggered children.
- **MagneticButton** — cursor-follow translate on hover, `active:scale-[.98]`, nested icon-circle kinetic shift (button-in-button trailing arrow).
- **FluidNav** — floating glass pill detached from top; hamburger→X morph; full-screen blur overlay on mobile with staggered link reveal.
- **Performance guardrails** — animate only `transform`/`opacity`; `backdrop-blur` only on fixed/sticky elements; `will-change` sparingly; no scroll listeners (use `whileInView` / IntersectionObserver); honor `prefers-reduced-motion` (disable transforms/blur reveals).

## 4. CSS architecture

Authored **website-local** this phase (`apps/website/src/index.css`), move-ready. The canonical shared token contract is finalized at the **components** phase — the demanding consumer (every component + `src/lib/themes/*` presets + registry `cssVars` for external `shadcn add`). Designing it earlier risks revising variable names later.

Relocation target: `packages/shadmin/src/styles/aurora.css` (new), `@import`ed by the package `index.css`. Consumer map (all verified):

| Consumer | How it gets the shared CSS (post-move) | Status today |
|---|---|---|
| demo | already `@import "../../../packages/shadmin/src/index.css"` + `@source` | ✅ works |
| components | they *are* `packages/shadmin/src` — native | ✅ inherent |
| docs | Tailwind v4 (`@tailwindcss/vite`) + `customCss: ["./src/styles/global.css"]` → one `@import` | ✅ trivial |
| website | switch local `@theme` to `@import` shared (this phase: stays local) | ⚠️ local now |

**Registry caveat (components phase):** external `shadcn add` consumers do not receive workspace files — shadcn copies tokens into their `globals.css` via registry `cssVars`/`css`. `registry.json` ships **0** css items today. The **registry generator** will emit aurora tokens from `aurora.css` into `registry.json` so distributed components carry the system downstream. Internal apps never need this.

## 5. Primitives (website-local: `apps/website/src/components/aurora/`)

`AuroraBackground` · `GlassPanel` (double-bezel) · `GradientText` · `Eyebrow` · `MagneticButton` · `Reveal` · `ThemeToggle`.

- `ThemeToggle` should **reuse the package's `src/hooks/use-theme.ts`** if it fits a simple `html.dark` toggle; otherwise a minimal local hook.
- Non-component exports (framer variants, constants, types) go in sibling `.ts` files (`src/lib/motion.ts`, theme hook) to avoid `react-refresh/only-export-components` warnings.
- Promote the genuinely reusable primitives (`GlassPanel`, `GradientText`, `ThemeToggle`) to `packages/shadmin` during the components/demo phases.

## 6. Section-by-section plan (App.tsx order)

| # | Section | Aurora treatment | Content fix |
|---|---|---|---|
| 1 | **Header → FluidNav** | floating glass island pill, gradient logo-dot, ThemeToggle, magnetic gradient "Star" CTA; mobile hamburger→X + full-screen blur overlay, staggered links | strip leftover dropdown cruft |
| 2 | **Hero** | aurora orbs bg, eyebrow, huge display headline w/ `GradientText` phrase, magnetic CTAs, real screenshot in double-bezel glass frame (keep `HotspotSvg`) | — |
| 3 | **Technos** | "Built on tools you trust" — 8 logos in glass row, mono→color on hover, stagger reveal | keep |
| 4 | **Features** | 8 cards → asymmetric **bento** glass grid (double-bezel), thin gradient-tint icons, hover lift | keep |
| 5 | **AdvancedCapabilities** | editorial split: copy left, glass-framed screenshot right, gradient check icons | keep |
| 6 | **Backends** | backend logos in glass tiles + schema diagram in bezel | "+40 more" → **"any REST/GraphQL API"** (data-provider count unverified) |
| 7 | **Open** | 3 glass stat tiles, gradient numbers | **honest stats** — real registry count: **165 components** (195 total items) |
| 8 | **Deploy** | hosting logos + glass command card | **kill fake terminal** → real `npx shadcn add` snippet, clearly illustrative |
| 9 | **Why** | 6 value cards in glass | **strip marmelab** links + "trusted expertise by marmelab maintainers"; reframe to shadmin/OSS |
| 10 | **ByDevelopers** | editorial, VSCode screenshot in bezel glass | keep |
| 11 | **Pricing** | single free-tier glass card, gradient accent | **strip** "we make a living with marmelab.com/react-admin" → honest MIT/free-forever line |
| 12 | ~~**Users**~~ | **CUT** | removed (false-association liability) |
| 13 | **CallToAction** | final full-width aurora gradient showpiece band, magnetic CTA | keep |
| 14 | **Footer** | glass footer, gradient logo | already cleaned (© 2026 Shadmin) |

## 7. File changes

**New**
- `apps/website/src/components/aurora/{AuroraBackground,GlassPanel,GradientText,Eyebrow,MagneticButton,Reveal,ThemeToggle}.tsx`
- `apps/website/src/lib/motion.ts` (framer variants/constants)
- `apps/website/src/lib/use-theme.ts` (only if the package hook doesn't fit)

**Edit**
- `apps/website/src/index.css` — aurora tokens (move-ready) + glass `@utility` + `.dark` overrides; `--font-sans: Geist`
- `apps/website/index.html` — drop Inter from the Google Fonts link (keep Geist); add no-flash theme-init script (reads `localStorage`; **defaults to dark** when unset; sets `html.dark` before paint). Note: the existing `@custom-variant dark (&:is(.dark *))` matches descendants of `.dark`, so the class on `<html>` themes `<body>` and below — confirm during build.
- `apps/website/package.json` — add `framer-motion`
- `apps/website/src/App.tsx` — remove `Users`, wire theme
- `apps/website/src/main.tsx` — theme init (if not handled inline in `index.html`)
- `apps/website/src/components/Header.tsx` — rewrite as fluid island nav
- All section components: `Hero, Technos, Features, AdvancedCapabilities, Backends, Deploy, Open, Why, ByDevelopers, Pricing, CallToAction, Footer` (+ `Container`, `NavLink`, `Logo` as needed)

**Delete**
- `apps/website/src/components/Users.tsx`

## 8. Build & verify

- `pnpm install` (framer-motion).
- **Visual:** Claude Preview MCP on the vite dev server (port 5174) — screenshot each section in **both** themes + responsive (`preview_resize`), fix in source, re-check. Toggle theme via `ThemeToggle`.
- **Gate:** `tsc -b` + `vite build` (website) + full `make build` green (website + docs + demo + registry assemble into `./public`).
- **Execution:** spec → `writing-plans` → **subagent-driven-development**, one section per task (repo convention).

## 9. Out of scope (future phases, in order)

1. **docs** — apply the design language; relocate the additive aurora layer to shared `aurora.css`.
2. **components** — adopt aurora; finalize the canonical semantic-token contract; integrate `src/lib/themes/*`; wire the registry generator to emit `cssVars`/`css`.
3. **demo** — apply the design language (already imports the shared CSS).

## 10. Assumptions

- Headline copy ("Build admin panels that don't look like admin panels.") is **placeholder** — confirm or replace during build.
- Backends section reframes the unverified "+40 more" to "any REST/GraphQL API" plus the named providers, rather than inventing a count.
- Deploy's fake terminal is replaced with a real, clearly-illustrative `npx shadcn add` snippet.
- Why/Pricing strip marmelab links; any reference to the foundation is a neutral factual "built on the ra-core foundation" at most, no marketing association.
- `framer-motion` latest is React 19-compatible (v11+).
- Light + dark both ship this phase; dark is the default.
