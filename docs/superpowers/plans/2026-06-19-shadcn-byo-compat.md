# shadcn BYO-compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make shadmin admin components run on a consumer's own stock shadcn/ui by removing every reach into a custom ui primitive, so `popover`/`dialog`/`tooltip` ship as bare stock deps instead of overwriting the consumer's.

**Architecture:** Consolidate the raw-primitive reach-ins (`DialogPrimitive`/`PopoverPrimitive`/`TooltipPrimitive`) behind a single swap seam `ui/primitives.ts` (re-exports from `radix-ui`). Drop the `*Primitive` re-exports from the stock ui files, drop tooltip's `<TooltipProvider>` auto-wrap (one provider at the Admin root instead), retire the 3 from `OUR_UI_ITEMS`, delete the `form.tsx` orphan, and resync local ui drift to canonical stock.

**Tech Stack:** React 19, TypeScript, shadcn 4.x registry, `radix-ui` (unified package), pnpm + turbo monorepo, Biome (lint), Vitest (browser provider).

## Global Constraints

- Commit directly to `main`; do not push unless asked. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Keep ra-core headless logic untouched — this plan only moves primitive imports and registry config.
- `radix-ui` is already a dependency; stock shadcn ui files already `import { X as XPrimitive } from "radix-ui"` internally — match that convention.
- No new npm dependencies.
- Keep `slot` and `direction` as custom `@shadmin` items (stock ships no equivalent — no conflict).
- Verify commands (adapt script names if they differ): lint `pnpm dlx @biomejs/biome check packages/shadmin/src`; typecheck `pnpm --filter shadmin typecheck`; build `pnpm turbo build`; registry build `cd packages/shadmin && pnpm run registry:build`; E2E `cd packages/shadmin && ./scripts/test-registry.sh`.

---

### Task 1: Primitive swap seam + decouple feature code (C1)

**Files:**
- Create: `packages/shadmin/src/components/ui/primitives.ts`
- Modify: `packages/shadmin/src/components/admin/feedback/confirm.tsx:5`
- Modify: `packages/shadmin/src/components/admin/buttons/columns-button.tsx:27`
- Modify: `packages/shadmin/src/components/admin/inputs/autocomplete-input.tsx:39`
- Modify: `packages/shadmin/src/components/admin/inputs/autocomplete-array-input.tsx` (multi-line popover import, ~lines 14-18)
- Modify: `packages/shadmin/src/components/rich-text-input/minimal-tiptap/components/toolbar-button.tsx:2`
- Modify: `packages/shadmin/src/components/ui/dialog.tsx` (export block)
- Modify: `packages/shadmin/src/components/ui/popover.tsx` (export block)

**Interfaces:**
- Produces: `@/components/ui/primitives` exporting `DialogPrimitive`, `PopoverPrimitive`, `TooltipPrimitive` (Radix namespaces). Task 2 drops `TooltipPrimitive` from `ui/tooltip.tsx`; Task 3 ships `primitives.ts` + retires the 3 stock files from `OUR_UI_ITEMS`.

- [ ] **Step 1: Create the swap seam**

`packages/shadmin/src/components/ui/primitives.ts`:
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

- [ ] **Step 2: Repoint the single-line importers**

In `confirm.tsx:5`, `columns-button.tsx:27`, `autocomplete-input.tsx:39`, change the import source only (symbol unchanged):
```ts
// confirm.tsx
import { DialogPrimitive } from "@/components/ui/primitives";
// columns-button.tsx  AND  autocomplete-input.tsx
import { PopoverPrimitive } from "@/components/ui/primitives";
```

In `toolbar-button.tsx:2`:
```ts
import type { TooltipPrimitive } from "@/components/ui/primitives";
```

- [ ] **Step 3: Repoint the multi-line importer**

In `autocomplete-array-input.tsx`, remove `PopoverPrimitive,` from the existing multi-line `import { ... } from "@/components/ui/popover";` block, and add a dedicated line:
```ts
import { PopoverPrimitive } from "@/components/ui/primitives";
```
(Leave the other popover imports — `Popover`, `PopoverContent`, etc. — importing from `@/components/ui/popover`.)

- [ ] **Step 4: Drop the `*Primitive` re-exports from the stock files**

In `ui/dialog.tsx`, remove the `DialogPrimitive,` line from the trailing `export { ... }` block (keep the internal `import { Dialog as DialogPrimitive } from "radix-ui"` — `DialogContent` etc. still use it).

In `ui/popover.tsx`, remove the `PopoverPrimitive,` line from the trailing `export { ... }` block (keep the internal import).

- [ ] **Step 5: Typecheck + build**

Run: `pnpm --filter shadmin typecheck && pnpm turbo build --filter=shadmin`
Expected: PASS. (If a file used `PopoverPrimitive.PopoverProps` as a type, it resolves identically through `primitives.ts`.)

- [ ] **Step 6: Grep gate**

Run: `grep -rn "Primitive.*@/components/ui/\(dialog\|popover\|tooltip\)" packages/shadmin/src --include=*.tsx`
Expected: no matches (all primitive reach-ins now go through `@/components/ui/primitives`).

- [ ] **Step 7: Commit**

```bash
git add packages/shadmin/src
git commit -m "refactor(ui): route raw primitives through ui/primitives swap seam

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Tooltip de-wrap + single root provider (C2)

**Files:**
- Modify: `packages/shadmin/src/components/ui/tooltip.tsx`
- Modify: `packages/shadmin/src/components/admin/admin.tsx`
- Modify (delete provider): `packages/shadmin/src/components/admin/buttons/sort-button.tsx`, `.../buttons/refresh-icon-button.tsx`, `.../buttons/inspector-button.tsx`, `.../common/icon-button-with-tooltip.tsx`, `.../list/data-table.tsx`, `.../fields/boolean-field.tsx`, `.../form/simple-form-iterator.tsx`

**Interfaces:**
- Consumes: `toolbar-button.tsx` already imports `TooltipPrimitive` from `primitives` (Task 1), so removing it from `ui/tooltip.tsx` is safe.

- [ ] **Step 1: Resync `ui/tooltip.tsx` to stock behavior**

Make `Tooltip` render the primitive directly (no `<TooltipProvider>` wrap) and drop `TooltipPrimitive` from the exports:
```tsx
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}
// ...
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```
(Remove the divergence NOTE comment too. Keep the internal `import { Tooltip as TooltipPrimitive } from "radix-ui"`.)

- [ ] **Step 2: Mount one provider at the Admin root**

In `components/admin/admin.tsx`, import `TooltipProvider` from `@/components/ui/tooltip` and wrap the admin tree so every descendant tooltip has an ancestor provider. Place it at the outermost shell the component renders.

- [ ] **Step 3: Delete redundant leaf providers**

In each of the 7 files listed, remove the local `<TooltipProvider>` wrapper (keep the `<Tooltip>` contents; unwrap one level) and drop the now-unused `TooltipProvider` import. Do NOT touch `ui/sidebar.tsx`, `minimal-tiptap.tsx`, or `block-editor.tsx` (those keep their providers for standalone use).

- [ ] **Step 4: Typecheck + build**

Run: `pnpm --filter shadmin typecheck && pnpm turbo build --filter=shadmin`
Expected: PASS.

- [ ] **Step 5: Verify tooltips still resolve (spec run if present)**

Run any existing tooltip/button spec, e.g. `cd packages/shadmin && pnpm vitest run src/components/admin/buttons/sort-button.spec.tsx` (skip if no such spec). Expected: PASS — provider at root covers the unwrapped tooltips.

- [ ] **Step 6: Commit**

```bash
git add packages/shadmin/src
git commit -m "refactor(ui): drop Tooltip auto-wrap; single TooltipProvider at Admin root

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Registry config — ship stock, delete orphan (C3 + C4)

**Files:**
- Modify: `packages/shadmin/scripts/granularize-block.mjs` (`OUR_UI_ITEMS`)
- Modify: `packages/shadmin/scripts/registry.config.mjs` (admin block `extraFiles`)
- Delete: `packages/shadmin/src/components/ui/form.tsx`

**Interfaces:**
- Consumes: `ui/primitives.ts` from Task 1 (now shipped here).

- [ ] **Step 1: Update `OUR_UI_ITEMS`**

In `granularize-block.mjs`, change the set to remove `popover`, `dialog`, `tooltip`, and the stale `color-picker`; add `primitives`:
```js
const OUR_UI_ITEMS = new Set([
  "slot",
  "direction",
  "primitives",
]);
```

- [ ] **Step 2: Update admin block `extraFiles`**

In `registry.config.mjs`, in the admin block `extraFiles`, remove the three lines for `popover.tsx`, `dialog.tsx`, `tooltip.tsx` and add:
```js
{ path: "src/components/ui/primitives.ts", type: "registry:ui" },
```
(Keep `slot.tsx`.)

- [ ] **Step 3: Delete the orphan**

Run: `rm packages/shadmin/src/components/ui/form.tsx`

- [ ] **Step 4: Rebuild the registry + inspect output**

Run: `cd packages/shadmin && pnpm run registry:build`
Then inspect `dist/r/admin.json`:
- `registryDependencies` now includes bare `"dialog"`, `"popover"`, `"tooltip"` (stock).
- `files` no longer contains `ui/dialog.tsx`, `ui/popover.tsx`, `ui/tooltip.tsx`.
- `files` (or a `@shadmin/primitives` item) includes `ui/primitives.ts`.

Run: `grep -l "primitives" dist/r/*.json` — expected: admin (and any block bundling it) reference primitives.

- [ ] **Step 5: Commit**

```bash
git add packages/shadmin/scripts packages/shadmin/dist
git rm packages/shadmin/src/components/ui/form.tsx
git commit -m "build(registry): ship dialog/popover/tooltip as stock deps; add primitives; drop form orphan

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Resync local ui drift to stock (Q3)

**Files:** the diverged, non-load-bearing ui files (listed in the spec) + `hooks/use-mobile.ts`. NOT `direction`, `slot`, `primitives`, or the Task-1/2 files.

- [ ] **Step 1: Re-pull stock for the drift files**

From repo root:
```bash
pnpm dlx shadcn@latest add --overwrite -c packages/shadmin \
  alert-dialog avatar button-group calendar carousel chart checkbox command \
  context-menu empty field input-group input-otp item kbd label menubar \
  slider sonner switch table tabs toggle
```
(If `shadcn` prompts, accept overwrite. It must NOT add new components beyond these — review with `git status` after.)

- [ ] **Step 2: Review the diff is stock-only**

Run: `git diff --stat packages/shadmin/src/components/ui`
Expected: only the listed files changed, toward stock (Tailwind class spellings, dropped exported `*Props` types, `"use client"` directives). No admin/feature files changed.

- [ ] **Step 3: Confirm nothing imported a dropped symbol**

Run: `pnpm --filter shadmin typecheck`
Expected: PASS. If a dropped exported type (e.g. `FieldProps`) was imported somewhere, the typecheck names it — fix that importer to use `React.ComponentProps<typeof Field>` inline (it was unused per audit, so this should not occur).

- [ ] **Step 4: Lint + build**

Run: `pnpm dlx @biomejs/biome check packages/shadmin/src && pnpm turbo build --filter=shadmin`
Expected: PASS. Fix any Biome formatting fallout from the stock output.

- [ ] **Step 5: Commit**

```bash
git add packages/shadmin/src/components/ui packages/shadmin/src/hooks
git commit -m "chore(ui): resync local primitives to canonical stock shadcn (no consumer impact)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: BYO E2E + full verification (Verify)

**Files:**
- Modify: `packages/shadmin/scripts/test-registry.sh`

**Interfaces:**
- Consumes: the rebuilt registry from Task 3.

- [ ] **Step 1: Add the BYO simulation to the E2E**

In `test-registry.sh`, in the admin (`guessers`) consumer flow, BEFORE `shadcn add ... admin.json`, install stock primitives into the scaffold and snapshot them:
```bash
echo "Simulating a BYO consumer: install STOCK dialog/popover/tooltip first"
pnpm dlx shadcn@4.11.0 add -y dialog popover tooltip
for f in dialog popover tooltip; do
  cp "src/components/ui/$f.tsx" "/tmp/byo-$f.before"
done
```
Then AFTER `shadcn add ... admin.json`, assert our install did not overwrite them and that `primitives.ts` landed:
```bash
echo "Verifying @shadmin/admin did NOT overwrite the consumer's stock primitives"
for f in dialog popover tooltip; do
  diff -q "/tmp/byo-$f.before" "src/components/ui/$f.tsx" \
    || { echo "FAIL: @shadmin overwrote consumer's stock $f.tsx"; exit 1; }
  grep -q "Primitive }" "src/components/ui/$f.tsx" \
    && { echo "FAIL: $f.tsx carries our *Primitive re-export"; exit 1; }
done
test -f src/components/ui/primitives.tsx -o -f src/components/ui/primitives.ts \
  || { echo "MISSING primitives"; exit 1; }
```
(The existing `pnpm run build` after this proves the consumer compiles on its own stock primitives + our `primitives`.)

- [ ] **Step 2: Run the full E2E**

Run: `cd packages/shadmin && ./scripts/test-registry.sh`
Expected: builds the registry, installs stock primitives, adds `@shadmin/admin` without overwriting them, builds the consumer app — all green; "All done!".

- [ ] **Step 3: Full local gates**

Run in parallel: `pnpm dlx @biomejs/biome check packages/shadmin/src`, `pnpm --filter shadmin typecheck`, `pnpm turbo build`.
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/shadmin/scripts/test-registry.sh
git commit -m "test(registry): BYO E2E — admin runs on consumer's own stock primitives

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage:** C1 → Task 1; C2 → Task 2; C3 → Task 3 (steps 1-2,4); C4 → Task 3 (step 3); Q3 → Task 4; Verification/BYO E2E → Task 5. Phase-2 (base-ui + clearly sim) intentionally absent (deferred). All Phase-1 spec sections covered.
- **Placeholders:** none — every edit shows the exact line/code; commands are concrete.
- **Type consistency:** `DialogPrimitive`/`PopoverPrimitive`/`TooltipPrimitive` names are identical across Tasks 1-2; `primitives.ts` path consistent in Tasks 1, 3, 5; `OUR_UI_ITEMS` final set matches the admin `extraFiles` change.
