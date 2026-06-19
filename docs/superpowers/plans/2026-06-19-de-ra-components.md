# De-RA components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove residual react-admin presentation idioms from shadmin components — replace the ra-core `FieldTitle` UI component with a shadcn-native `<FieldLabelText>` (33 files), rename the MUI-shaped menu API (`primaryText`/`leftIcon` → `label`/`icon`), and recompose `filter-button` onto a shadcn primitive — while keeping all ra-core headless logic.

**Architecture:** Keep the headless i18n hook (`useTranslateLabel` from `shadmin-core`); only the RA *component* `FieldTitle` dies, replaced by a thin local `<FieldLabelText>` that composes nothing custom (BYO-clean). Menu rename is internal-only (no app consumers). filter-button swaps a hand-rolled `<div role="menuitemcheckbox">` for shadcn `<DropdownMenuCheckboxItem>`.

**Tech Stack:** React 19, TypeScript, shadcn 4.x registry, ra-core via `shadmin-core` barrel, pnpm + turbo, Biome, Vitest browser provider.

## Global Constraints

- Commit directly to `main`; do not push. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Keep ra-core headless logic — only the `FieldTitle` *component* and the MUI prop *names* change; `useTranslateLabel`, `useInput`, etc. stay.
- `<FieldLabelText>` lives at `packages/shadmin/src/components/admin/common/field-label-text.tsx`; all 33 swap sites import it from `@/components/admin/common/field-label-text`. (It is auto-bundled into the admin registry block via the recursive `components/admin` sourceDir — no registry-config change needed, same as `input-helper-text.tsx`.)
- Do NOT touch shadcn's `ui/field` `FieldTitle` (a styled `<div>`) — unrelated; it stays. The de-RA target is ONLY `FieldTitle` imported `from "shadmin-core"`.
- No new npm dependencies.
- Breaking API changes are free (no external users yet).
- Verify commands (adapt if a script name differs): typecheck `pnpm --filter shadmin typecheck`; lint `pnpm dlx @biomejs/biome check packages/shadmin/src`; a single browser spec `cd packages/shadmin && pnpm vitest run <path>`; E2E `cd packages/shadmin && ./scripts/test-registry.sh`.

---

### Task 1: Create `<FieldLabelText>` + swap the 4 non-input sites

**Files:**
- Create: `packages/shadmin/src/components/admin/common/field-label-text.tsx`
- Modify: `packages/shadmin/src/components/admin/fields/record-field.tsx`
- Modify: `packages/shadmin/src/components/admin/inspector/field-toggle.tsx`
- Modify: `packages/shadmin/src/components/admin/list/data-table.tsx`
- Modify: `packages/shadmin/src/components/admin/views/labeled.tsx`

**Interfaces:**
- Produces: `FieldLabelText` (named export) — props `{ source?: string; resource?: string; label?: ReactNode; isRequired?: boolean }`, identical to ra-core `FieldTitle`'s. Tasks 2 and 4 import it the same way.

- [ ] **Step 1: Create the component**

`packages/shadmin/src/components/admin/common/field-label-text.tsx`:
```tsx
import type { ReactNode } from "react";
import { useTranslateLabel } from "shadmin-core";

interface FieldLabelTextProps {
  source?: string;
  resource?: string;
  /** A string is translated; a ReactNode renders as-is; `false`/`""` renders nothing. */
  label?: ReactNode;
  isRequired?: boolean;
}

/**
 * Renders a field/input's resolved, translated label text (+ required marker).
 * shadcn-native replacement for ra-core's `<FieldTitle>`: keeps the headless
 * `useTranslateLabel` logic, drops the RA component. Composes inside a shadcn
 * `<FieldLabel>` for inputs, or standalone for table headers / record fields.
 */
export function FieldLabelText({
  source,
  resource,
  label,
  isRequired,
}: FieldLabelTextProps) {
  const translateLabel = useTranslateLabel();
  if (label === false || label === "") return null;
  if (label != null && typeof label !== "string") return <>{label}</>;
  return (
    <span>
      {translateLabel({ label, source, resource })}
      {isRequired && <span aria-hidden="true">&thinsp;*</span>}
    </span>
  );
}
```

- [ ] **Step 2: Swap the 4 non-input sites**

In each of `record-field.tsx`, `field-toggle.tsx`, `data-table.tsx`, `labeled.tsx`:
1. Remove `FieldTitle` from the `from "shadmin-core"` import (leave the other symbols on that import).
2. Add `import { FieldLabelText } from "@/components/admin/common/field-label-text";`.
3. Replace every `<FieldTitle ... />` with `<FieldLabelText ... />` (props are identical — `label`/`source`/`resource`/`isRequired`).

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter shadmin typecheck`
Expected: PASS.

- [ ] **Step 4: Run the touched specs (those that exist)**

Run: `cd packages/shadmin && pnpm vitest run src/components/admin/views/labeled.spec.tsx`
Expected: PASS. (labeled.spec.tsx exists and renders the label — proves `FieldLabelText` resolves identically.)

- [ ] **Step 5: Commit** (specific `git add` of only these 5 files)

```bash
git add packages/shadmin/src/components/admin/common/field-label-text.tsx \
  packages/shadmin/src/components/admin/fields/record-field.tsx \
  packages/shadmin/src/components/admin/inspector/field-toggle.tsx \
  packages/shadmin/src/components/admin/list/data-table.tsx \
  packages/shadmin/src/components/admin/views/labeled.tsx
git commit -m "refactor(admin): add FieldLabelText, replace ra-core FieldTitle in non-input sites

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Swap `FieldTitle` → `FieldLabelText` in all 28 input files

**Files (Modify):** the 16 admin inputs — `array-input`, `autocomplete-array-input`, `autocomplete-input`, `boolean-input`, `checkbox-group-input`, `date-input`, `date-time-input`, `file-input`, `nullable-boolean-input`, `number-input`, `radio-button-group-input`, `select-array-input`, `select-input`, `text-array-input`, `text-input`, `time-input` (all under `packages/shadmin/src/components/admin/inputs/`); plus the 12 non-core inputs — `packages/shadmin/src/components/extras/{color-input,cron-input,currency-input,duration-input,phone-input,rating-input,subscription-plan-picker,webhook-endpoint-input}.tsx`, `packages/shadmin/src/components/block-editor/block-editor-input.tsx`, `packages/shadmin/src/components/mdx-editor/mdx-input.tsx`, `packages/shadmin/src/components/monaco/monaco-json-input-lazy.tsx`, `packages/shadmin/src/components/rich-text-input/rich-text-input.tsx`.

**Interfaces:**
- Consumes: `FieldLabelText` from `@/components/admin/common/field-label-text` (Task 1).

- [ ] **Step 1: Apply the identical swap to all 28 files**

Each file uses the same pattern: `<FieldLabel htmlFor={id}><FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} /></FieldLabel>` (shadcn `FieldLabel` is the `<label>`, ra `FieldTitle` is the text). In every file:
1. Remove `FieldTitle` from the `from "shadmin-core"` import (keep the rest of that import).
2. Add `import { FieldLabelText } from "@/components/admin/common/field-label-text";`.
3. Rename the JSX tag `<FieldTitle` → `<FieldLabelText` (props unchanged). Keep the surrounding shadcn `<FieldLabel>` exactly as-is.

You may script the edit, but verify each file compiles (some imports are multi-line; ensure you removed only `FieldTitle`, not a sibling symbol).

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter shadmin typecheck`
Expected: PASS.

- [ ] **Step 3: Grep gate — no FieldTitle left in inputs**

Run: `grep -rn "FieldTitle" packages/shadmin/src/components/admin/inputs packages/shadmin/src/components/extras packages/shadmin/src/components/{block-editor,mdx-editor,monaco,rich-text-input} | grep shadmin-core`
Expected: no matches.

- [ ] **Step 4: Run one representative input spec**

Run: `cd packages/shadmin && pnpm vitest run src/components/admin/inputs/text-input.spec.tsx`
Expected: PASS (if the spec exists; otherwise run another inputs spec that renders a label).

- [ ] **Step 5: Commit** (specific `git add` of the 28 files)

```bash
git add packages/shadmin/src/components/admin/inputs packages/shadmin/src/components/extras \
  packages/shadmin/src/components/block-editor/block-editor-input.tsx \
  packages/shadmin/src/components/mdx-editor/mdx-input.tsx \
  packages/shadmin/src/components/monaco/monaco-json-input-lazy.tsx \
  packages/shadmin/src/components/rich-text-input/rich-text-input.tsx
git commit -m "refactor(inputs): replace ra-core FieldTitle with FieldLabelText (28 inputs)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Rename the MUI menu API (`primaryText`/`leftIcon` → `label`/`icon`)

**Files (Modify):**
- `packages/shadmin/src/components/admin/layout/menu-item-link.tsx` (the keystone — defines the props)
- `packages/shadmin/src/components/admin/layout/resource-menu-item.tsx`
- `packages/shadmin/src/components/admin/layout/dashboard-menu-item.tsx`
- `packages/shadmin/src/components/admin/layout/menu.tsx` (internal usage)
- `packages/shadmin/src/components/realtime/menu-live.tsx` (internal usage)
- Stories: `menu-item-link.stories.tsx`, `menu.stories.tsx`, `layout.stories.tsx`, `menu-live.stories.tsx`

- [ ] **Step 1: Rename in `menu-item-link.tsx`**

In `MenuItemLinkProps`: rename prop `primaryText` → `label`, `leftIcon` → `icon`. Update the destructure in the function signature and every reference in the body (the `finalText` computation uses `primaryText` → `label`; the JSX renders `leftIcon` → `icon`). Update the JSDoc `@example` to use `label=` / `icon=`.

- [ ] **Step 2: Rename in `resource-menu-item.tsx` + `dashboard-menu-item.tsx`**

Same prop rename (`primaryText` → `label`, `leftIcon` → `icon`) in their props types, destructures, and where they forward to `<MenuItemLink>`. In `resource-menu-item.tsx` also tighten the loose `[rest: string]: unknown` index signature to the explicit props it forwards (`className`, `onClick`, and `tooltipProps` if used) — drop the index signature.

- [ ] **Step 3: Update internal callers + stories**

In `menu.tsx`, `menu-live.tsx`, and the 4 stories, rename every `primaryText=`/`leftIcon=` prop usage to `label=`/`icon=`.

- [ ] **Step 4: Typecheck + grep gate**

Run: `pnpm --filter shadmin typecheck`
Expected: PASS.
Run: `grep -rn "primaryText\|leftIcon" packages/shadmin/src/components/admin/layout packages/shadmin/src/components/realtime`
Expected: no matches. (Note: `simple-list` ALSO uses `primaryText`/`leftIcon` — that is the SimpleList render-slot API, explicitly OUT OF SCOPE; do not touch `components/admin/list/`.)

- [ ] **Step 5: Run a menu spec**

Run: `cd packages/shadmin && pnpm vitest run src/components/admin/layout/menu-item-link.spec.tsx`
Expected: PASS (if it exists; else `menu.spec.tsx`).

- [ ] **Step 6: Commit** (specific `git add` of the 9 files)

```bash
git add packages/shadmin/src/components/admin/layout/menu-item-link.tsx \
  packages/shadmin/src/components/admin/layout/resource-menu-item.tsx \
  packages/shadmin/src/components/admin/layout/dashboard-menu-item.tsx \
  packages/shadmin/src/components/admin/layout/menu.tsx \
  packages/shadmin/src/components/admin/layout/menu-item-link.stories.tsx \
  packages/shadmin/src/components/admin/layout/menu.stories.tsx \
  packages/shadmin/src/components/admin/layout/layout.stories.tsx \
  packages/shadmin/src/components/realtime/menu-live.tsx \
  packages/shadmin/src/components/realtime/menu-live.stories.tsx
git commit -m "refactor(layout): rename menu API primaryText/leftIcon -> label/icon

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Recompose `filter-button` + swap its FieldTitle

**Files (Modify):** `packages/shadmin/src/components/admin/buttons/filter-button.tsx`

**Interfaces:**
- Consumes: `FieldLabelText` (Task 1); `DropdownMenuCheckboxItem` from `@/components/ui/dropdown-menu`.

- [ ] **Step 1: Read `FilterButtonMenuItem`**

Read `filter-button.tsx` (function `FilterButtonMenuItem`, ~lines 323-400). It renders a hand-rolled `<div role="menuitemcheckbox" onClick onKeyDown>` containing a checkbox-indicator `<div>` and a label `<div><FieldTitle .../></div>`. Note its current toggle behavior (onClick toggles the filter; onKeyDown handles Enter/Space; the indicator shows checked state).

- [ ] **Step 2: Recompose onto `DropdownMenuCheckboxItem`**

Replace the hand-rolled `<div role="menuitemcheckbox">` with shadcn `<DropdownMenuCheckboxItem checked={isChecked} onCheckedChange={handleToggle}>` (add `DropdownMenuCheckboxItem` to the existing `@/components/ui/dropdown-menu` import). `DropdownMenuCheckboxItem` provides the checkbox indicator, the `role`, and keyboard handling natively — so delete the manual indicator `<div>`, the manual `onClick`/`onKeyDown`, and the manual `role`. Preserve the exact toggle semantics (map the old onClick toggle to `onCheckedChange`). Render the label via `<FieldLabelText label={label} source={source} resource={resource} />` (this also performs the FieldTitle→FieldLabelText swap for this file — remove `FieldTitle` from the `shadmin-core` import + add the `FieldLabelText` import).

- [ ] **Step 3: Typecheck + spec**

Run: `pnpm --filter shadmin typecheck`
Expected: PASS.
Run: `cd packages/shadmin && pnpm vitest run src/components/admin/buttons/filter-button.spec.tsx`
Expected: PASS — the recompose preserves toggle behavior (if the spec asserts filter add/remove on click, it still passes via `onCheckedChange`).

- [ ] **Step 4: Commit**

```bash
git add packages/shadmin/src/components/admin/buttons/filter-button.tsx
git commit -m "refactor(buttons): recompose FilterButtonMenuItem on DropdownMenuCheckboxItem; drop FieldTitle

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Final verification

**Files:** none (verification only; may add a fix commit if a gate fails).

- [ ] **Step 1: Global grep gates**

Run: `grep -rn "FieldTitle" packages/shadmin/src --include=*.tsx | grep 'shadmin-core'`
Expected: **no matches** — ra-core `FieldTitle` fully removed (shadcn `ui/field` `FieldTitle` is unaffected; it's imported from `@/components/ui/field`, not `shadmin-core`).
Run: `grep -rn "primaryText\|leftIcon" packages/shadmin/src/components/admin/layout packages/shadmin/src/components/realtime`
Expected: no matches.

- [ ] **Step 2: Full local gates (parallel)**

Run: `pnpm dlx @biomejs/biome check packages/shadmin/src`, `pnpm --filter shadmin typecheck`, `pnpm turbo build`.
Expected: all PASS. Fix any Biome formatting fallout from the swaps.

- [ ] **Step 3: E2E**

Run: `cd packages/shadmin && ./scripts/test-registry.sh`
Expected: green ("All done!") — `FieldLabelText` is auto-bundled in the admin block (recursive `components/admin` sourceDir); the consumer build still passes. (shadcn exits 0 on error — read output for real failures.)

- [ ] **Step 4: Commit any fixes** (only if Step 2/3 required edits)

```bash
git add -A && git commit -m "fix: resolve de-RA verification fallout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage:** WS1 (FieldTitle→FieldLabelText, 33 files) → Task 1 (component + 4) + Task 2 (28) + Task 4 (filter-button's 1) = 33 ✓; WS2 (menu API) → Task 3; WS3 (filter-button recompose) → Task 4; verification + grep gates → Task 5. Out-of-scope items (simple-list, guessers, Base/View, sanitize utils, `<Translate>`, variant phantoms) correctly untouched — Task 3 step 4 explicitly fences `simple-list`.
- **Placeholders:** none — `FieldLabelText` code is complete; swap pattern is explicit; menu renames enumerated; filter-button recompose names the exact primitive (`DropdownMenuCheckboxItem`) and the behavior to preserve.
- **Type consistency:** `FieldLabelText` prop shape (`source`/`resource`/`label`/`isRequired`) matches ra-core `FieldTitle`'s exactly, so every swap is prop-identical; import path `@/components/admin/common/field-label-text` is consistent across Tasks 1, 2, 4.
