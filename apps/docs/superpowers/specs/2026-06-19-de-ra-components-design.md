# De-RA the shadmin components — design

**Date:** 2026-06-19
**Status:** ratified, ready for implementation plan
**Scope tier:** Surface + internals + `FieldTitle` (excludes guesser / Base-View architectural teardowns)

## Goal

Finish the structural de-react-admin work on the shadmin component library
(replan layer 2). The import seam is already done — 0 components import
`ra-core` directly; all 459 go through the `shadmin-core` barrel. This pass
removes residual **react-admin / ra-ui-materialui presentation idioms** while
keeping ra-core's **headless logic** (hooks, controllers, i18n) intact.

The rule, unchanged from the ratified direction: *keep the headless hooks
from `shadmin-core`; kill the RA UI components in JSX and the MUI-shaped prop
names.* Most of the library (~80% of 163 component files) already matches the
target idiom (see `text-input.tsx`, `app-sidebar.tsx`); this closes the gap.

## Audit result (what is and isn't actually RA)

A 12-agent category audit + manual ground-truthing found the genuine surface
is **much smaller** than a naive scan suggests. Confirmed **non-issues** (audit
false positives — do NOT touch):

- **"MUI `variant` enums"** — every flagged `variant` is already the shadcn
  enum (`save`/`delete`/`update`/`bulk-*` buttons use
  `default|destructive|outline|secondary|ghost|link`; `badge`/`chip`-field use
  shadcn `Badge` variants; `record-field`'s `default|inline` is a flex-layout
  flag). Nothing to change.
- **`sanitize{Input,Field,Rest}Props`** — already a **local** util
  (`lib/sanitize-input-rest-props.ts`) that strips RA controller props before
  DOM spread. Load-bearing — required by the `InputProps` contract we keep.
  Removing it reintroduces React DOM-attribute warnings for zero gain.
- **`<Translate i18nKey>` vs `translate()` hook** — both are headless i18n,
  no MUI. Swapping is pure churn.
- **`ra-input` CSS class names** — cosmetic; may be referenced by consumer or
  internal CSS. Risk > reward.

## In scope

### WS1 — Remove the RA `FieldTitle` component (33 files + 1 new)

`FieldTitle` (imported from `shadmin-core`, i.e. ra-core) is a ~15-line
component: `useTranslateLabel()` wrapped in
`<span>{text}{isRequired && " *"}</span>`. The i18n logic
(`useTranslateLabel` → `getFieldLabelTranslationArgs`) is headless and **stays**.
Only the RA *component* is replaced.

**New component** — `components/admin/common/field-label-text.tsx`:

```tsx
import type { ReactNode } from "react";
import { useTranslateLabel } from "shadmin-core";

interface FieldLabelTextProps {
  source?: string;
  resource?: string;
  label?: ReactNode; // string renders translated; ReactNode renders as-is; false/"" → null
  isRequired?: boolean;
}

/**
 * Renders a field/input's resolved, translated label text (+ required marker).
 * shadcn-native replacement for ra-core's <FieldTitle>; composes inside a
 * shadcn <FieldLabel> for inputs, or standalone for table headers / record fields.
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

> Naming: shadcn's `ui/field` already owns `FieldTitle` (a styled `<div>`) and
> `FieldLabel` (the `<label>`) — both unrelated shadcn primitives that stay.
> The replacement is therefore named **`FieldLabelText`** to avoid collision.

**Swap sites (33)** — replace `import { FieldTitle } from "shadmin-core"` +
`<FieldTitle .../>` with `FieldLabelText` (identical props):

- 16 admin inputs: `array`, `autocomplete-array`, `autocomplete`, `boolean`,
  `checkbox-group`, `date`, `date-time`, `file`, `nullable-boolean`, `number`,
  `radio-button-group`, `select-array`, `select`, `text-array`, `text`, `time`.
- 8 extras inputs: `color`, `cron`, `currency`, `duration`, `phone`, `rating`,
  `subscription-plan-picker`, `webhook-endpoint`.
- 4 custom inputs: `mdx-editor/mdx-input`, `monaco/monaco-json-input-lazy`,
  `block-editor/block-editor-input`, `rich-text-input/rich-text-input`.
- 5 non-input: `fields/record-field`, `list/data-table`, `views/labeled`,
  `inspector/field-toggle`, `buttons/filter-button`.

This resolves the audit's `inspector/field-toggle` "heavy" flag (WS4) outright.

### WS2 — Rename the MUI menu API (`primaryText`/`leftIcon` → `label`/`icon`)

Menu item internals already compose `SidebarMenuButton`/`SidebarMenuItem`
cleanly — the only RA-ism is the MUI prop names. Blast radius is **internal
only** (no demo/app consumer uses these props). Decision: structured
`label` + `icon` props (not children-based) — the auto-generation path
(`Menu`, `ResourceMenuItem` from resource definitions) needs structured data,
and tooltip-on-collapse needs the label as text.

- `layout/menu-item-link.tsx` — `primaryText` → `label`, `leftIcon` → `icon`.
- `layout/resource-menu-item.tsx` — same; also tighten the
  `[rest: string]: unknown` index signature to explicit forwarded props.
- `layout/dashboard-menu-item.tsx` — same (delegates to `MenuItemLink`).
- `layout/menu.tsx`, `realtime/menu-live.tsx` — update internal usage.
- Stories/specs touching these props: `menu-item-link.stories`,
  `menu.stories`, `layout.stories`, `infinite-list.stories`,
  `menu-live.stories`.

### WS3 — Recompose `buttons/filter-button.tsx`

`FilterButtonMenuItem` renders a hand-rolled `<div>` with click/keyboard
handling instead of composing the shadcn primitive. Rebuild it on
`DropdownMenuItem` (or `Button`, matching the surrounding menu). Its
`FieldTitle` usage is covered by WS1.

### WS4 — `inspector/field-toggle.tsx`

Its sole RA-ism is `FieldTitle`; fully covered by WS1. No separate work beyond
the swap. `fields-selector.tsx` (depends on field-toggle) needs no change once
field-toggle is clean.

## Out of scope (explicit)

- **Guessers** (`list`/`edit`/`show`-guesser) — `InferredElement` AST builder.
  Dev-time scaffolding; big rewrite, low ROI. Deferred.
- **Reference-field `Base`+`View` split** (`reference-array`/`-one`/`-many`-field,
  `array-field`) — the `Base` controllers are headless (from `shadmin-core`)
  and the split is arguably correct. Deferred.
- **`simple-list`** RA render-slot API (`primaryText`/`secondaryText`/
  `tertiaryText`/`leftIcon`/`rightIcon`) — canonical SimpleList contract,
  render-props read less MUI-smelly than the menu API, separate component
  family. Deferred to its own pass if wanted.
- All audit false-positives listed above.

## Execution

Per project convention (`feedback_execution_mode`): writing-plans →
`superpowers:subagent-driven-development`. WS1's 33 swaps are independent and
mechanical → fan out across parallel implementer agents (each: swap import +
JSX, run the file's own spec). WS2/WS3 are small, sequential within layout.

Order: **WS1 first** (create `FieldLabelText`, then fan the swaps) so
field-toggle/filter-button's FieldTitle is gone before WS3 touches
filter-button; then WS2; then WS3.

## Breaking changes

Free — no external users yet (ratified 2026-06-17). Menu API rename
(`primaryText`/`leftIcon` → `label`/`icon`) and the `FieldTitle` export removal
are the only consumer-visible deltas; both are intentional.

## Verification

- Per workstream: `biome` lint + `tsc` typecheck + the touched files' colocated
  specs (browser-provider specs at task end, not per step).
- Phase boundary (end of all WS): full package typecheck + turbo build (3 apps)
  + E2E `test-registry.sh` (confirms `FieldLabelText` bundles into the admin
  block and the consumer still builds). `FieldTitle` must no longer appear in
  any `components/` source (`grep` gate).
- Registry: regenerate; assert no unintended `dist/r` deltas beyond the new
  `field-label-text` file landing in the admin block bundle.
