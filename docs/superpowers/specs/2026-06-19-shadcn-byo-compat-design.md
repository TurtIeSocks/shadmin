# shadcn BYO-compatibility — decouple from custom primitives

**Date:** 2026-06-19
**Status:** ratified, ready for implementation plan
**Prereq for:** the de-RA components pass (`2026-06-19-de-ra-components-design.md`) — lands first.

## Goal

Make shadmin's admin components **fully compatible with a consumer's own stock
shadcn/ui base**, so a user who runs `shadcn add @shadmin/admin` keeps their
existing `dialog`/`popover`/`tooltip`/etc. instead of having ours overwrite
them. The library's north star is shadcn-native; shadcn 4.x lets consumers
bring their own primitives, and we should not fight that.

## Background (audit findings, 2026-06-19)

A consumer only ever receives the **6 items in `OUR_UI_ITEMS`** (`slot`,
`color-picker`, `direction`, `popover`, `dialog`, `tooltip`); every other ui
primitive resolves to a **bare stock shadcn `registryDependency`** (consumer
gets shadcn upstream, never our local copy). Of the 6:

- `slot`, `direction`, `color-picker` — stock ships **no equivalent** → no
  overwrite conflict. (`color-picker` is a stale `OUR_UI_ITEMS` entry — the file
  no longer exists; drop it from the set.)
- `popover`, `dialog`, `tooltip` — stock **does** ship these → our copies
  overwrite a consumer's own. **This is the entire BYO-incompatibility
  surface.**

Why those 3 are custom: our admin/feature code reaches past the stock public
API into the raw Radix primitive via `*Primitive` re-exports. The **complete**
set of such reach-ins is 4 files / 3 primitives:

| Primitive | Files (usage) |
|---|---|
| `DialogPrimitive` | `admin/feedback/confirm.tsx` (type-only) |
| `PopoverPrimitive` | `admin/buttons/columns-button.tsx` (JSX), `admin/inputs/autocomplete-input.tsx` (type), `admin/inputs/autocomplete-array-input.tsx` |
| `TooltipPrimitive` | `rich-text-input/minimal-tiptap/components/toolbar-button.tsx` (type-only) |

Plus one behavioral customization: our `ui/tooltip.tsx` auto-wraps `<Tooltip>`
in `<TooltipProvider>` (stock requires an app-level provider).

No feature file imports directly from `radix-ui` today, and no non-ui file
imports any other non-stock ui symbol (the audit's other "ours-only" exports
were unused TS interface types). So the surface below is exhaustive.

## Workstreams

### C1 — Consolidate raw primitives behind one swap seam

New file `src/components/ui/primitives.ts`:

```ts
// The primitive base layer — the single swap point. Re-base every shadmin
// component that needs a RAW primitive (past the stock shadcn public API) by
// changing this file's source: radix-ui → base-ui → clearly. Stock shadcn
// ships no `primitives` item, so this never conflicts with a consumer's ui/.
export {
  Dialog as DialogPrimitive,
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from "radix-ui";
```

Repoint the 4 importers from `@/components/ui/{dialog,popover,tooltip}` to
`@/components/ui/primitives` (preserve `import type` where usage is type-only:
confirm, autocomplete-input, toolbar-button; value import where used as JSX:
columns-button, autocomplete-array-input). Drop the `*Primitive` re-exports
from `ui/dialog.tsx` and `ui/popover.tsx` (they become plain stock).

> Honest caveat: a *bare re-export* swap only works for a base that mirrors
> Radix's namespace shape (`.Root`/`.Content`/`.Portal`). base-ui differs
> (`.Popup`), so a base-ui swap needs an *adapter* in this file — but still in
> **one place**. Validating that adapter cost per base is Phase 2 (below).

### C2 — Tooltip: drop auto-wrap, single root provider

- `ui/tooltip.tsx` → resync to stock: remove the `<TooltipProvider>` auto-wrap
  and the `TooltipPrimitive` re-export.
- Mount one `<TooltipProvider>` at the Admin root (`components/admin/admin.tsx`).
- **Delete** the now-redundant local `<TooltipProvider>` in Admin-only leaves:
  `sort-button`, `refresh-icon-button`, `inspector-button`,
  `icon-button-with-tooltip`, `data-table`, `boolean-field`,
  `simple-form-iterator`.
- **Keep** providers in standalone-capable components: `minimal-tiptap`,
  `block-editor`. **Do not touch** `ui/sidebar.tsx` (stock ships its own).

### C3 — Registry config: ship stock, not our copies

- `scripts/granularize-block.mjs` `OUR_UI_ITEMS`: remove `popover`, `dialog`,
  `tooltip`, and the stale `color-picker`; add `primitives`. Keep `slot`,
  `direction`.
- `scripts/registry.config.mjs` admin block `extraFiles`: remove the
  `popover`/`dialog`/`tooltip` `registry:ui` entries; add
  `{ path: "src/components/ui/primitives.ts", type: "registry:ui" }`.
- Result: `popover`/`dialog`/`tooltip` resolve to **bare stock
  `registryDependencies`** (shadcn recomputes them from the imports);
  `primitives` ships as `@shadmin/primitives`, bundled in the admin block and
  reaching `rich-text-input` transitively (it depends on `@shadmin/admin`).

### C4 — Delete the `form.tsx` orphan

`src/components/ui/form.tsx` is stock shadcn's legacy `Form`/`FormField`
(react-hook-form), added by the consumer's `shadcn add --all`. We are
`Field`-based and import none of it. Delete it.

### Q3 — Resync local drift to stock

Re-pull canonical stock for the diverged, **non-load-bearing** ui files so our
local copies stop silently drifting from upstream (these aren't shipped, but
keeping them stock-accurate prevents wrong assumptions during future upgrades):

`shadcn add --overwrite -c packages/shadmin <files>` for: `alert-dialog`,
`avatar`, `button-group`, `calendar`, `carousel`, `chart`, `checkbox`,
`command`, `context-menu`, `empty`, `field`, `input-group`, `input-otp`,
`item`, `kbd`, `label`, `menubar`, `slider`, `sonner`, `switch`, `table`,
`tabs`, `toggle`, plus `hooks/use-mobile`.

Preserve / re-apply only documented intentional deltas:
- **Keep custom:** `direction` (RTL `DirectionProvider`), `slot` (radix Slot
  re-export). Not part of the resync.
- **`slider`:** stock thumb is `bg-white`; ours was `bg-background` (dark-mode
  fix). Consumers already get stock `bg-white`, so resync to stock for parity
  and note the dark-mode thumb as known upstream behavior (revisit separately
  if it matters).
- Drop our unused exported interface types (`FieldProps`, `ChartContainerProps`,
  etc.) and `LabelPrimitive` re-export — admin imports none of them.

Run lint/typecheck/build after resync; fix any class-name/format fallout.

## Verification

- lint + package/website typecheck + turbo build (3 apps).
- **BYO E2E (Phase-1 / radix):** extend `scripts/test-registry.sh` — in the
  consumer scaffold, BEFORE `shadcn add @shadmin/admin`, run
  `shadcn add dialog popover tooltip` (stock). Then add admin. Assert:
  1. the consumer's stock `dialog`/`popover`/`tooltip` files are **not
     overwritten** (no `*Primitive` re-export / no auto-wrap markers in them);
  2. `primitives.ts` landed;
  3. consumer build passes.
  This proves admin runs on the consumer's own stock primitives.
- `grep` gate: no non-ui file imports `*Primitive` from
  `@/components/ui/{dialog,popover,tooltip}` (only from `primitives`).

## Out of scope — Phase 2 (separate spec/spike)

The **three-base BYO simulation** (radix-ui ✓ done here; **base-ui**
`@base-ui-components/react`; **clearly** — the incoming glass UI, a local repo
path to be provided). A feasibility spike that swaps `primitives.ts`'s source
to each base and reports the per-base adapter cost. Deferred so the concrete
decouple lands first; it does not block the de-RA pass either.

## Sequencing

C1–C4 + Q3 land as one unit (this spec) → then the de-RA components pass
resumes (its `FieldLabelText` already composes stock `FieldLabel`, so it is
BYO-clean) → Phase-2 multi-base spike last.
