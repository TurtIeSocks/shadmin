# ra-ui-materialui Parity — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land Phase 1 of 1:1 component parity with `ra-ui-materialui` — 47 new files and a layout refactor in `shadcn-admin-kit`, on the `full-claude` branch.

**Architecture:** Each new component wraps `ra-core` hooks (logic) with `shadcn/ui` primitives (presentation). Components are dispatched to subagents in dependency-ordered waves: 5 parallel leaf-component subagents → 2 parallel composite subagents → 1 serial layout-refactor subagent → 1 demo-integration subagent.

**Tech Stack:** React 19, TypeScript, `ra-core` 5.x, shadcn/ui (Tailwind v4, Radix), Vitest + Playwright (browser), Storybook 10, pnpm.

**Spec:** [docs/superpowers/specs/2026-05-11-ra-ui-materialui-parity-design.md](../specs/2026-05-11-ra-ui-materialui-parity-design.md)

**Reference codebases:**

- Upstream MUI implementation: `/Users/rin/GitHub/react-admin/packages/ra-ui-materialui/src/`
- shadcn-admin-kit current: `/Users/rin/GitHub/shadcn-admin-kit/src/`

---

## Conventions every subagent must follow

Before writing any new file, the subagent should briefly read **two** existing files:

1. **The upstream MUI version** of the component being ported, e.g. `/Users/rin/GitHub/react-admin/packages/ra-ui-materialui/src/button/CloneButton.tsx`. Source of truth for prop API and behavior.
2. **An analogous existing shadcn-admin-kit component**, e.g. `src/components/admin/edit-button.tsx`. Source of truth for code conventions, imports, classes, JSDoc style.

Then implement the component **using shadcn-admin-kit conventions** with the **upstream's prop API**.

### File locations (the layout actually used by this repo)

| Artifact          | Location                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Component         | `src/components/admin/<kebab>.tsx`                                                            |
| Story             | `src/stories/<kebab>.stories.tsx`                                                             |
| Test (when added) | `src/components/admin/<kebab>.spec.tsx` (co-located)                                          |
| Docs page         | `docs/src/content/docs/<PascalCase>.md`                                                       |
| Registry entry    | new `{ "path": ..., "type": "registry:component" }` object inside `registry.json` files array |

### Per-component standard template

Every new component file must:

- Import `ra-core` hooks for logic
- Import shadcn/ui primitives from `@/components/ui/`
- Use `cn()` from `@/lib/utils` for class merging
- Export a named `Component` and a `ComponentProps` type
- Include a JSDoc with `@see {@link https://marmelab.com/shadcn-admin-kit/docs/<kebab>/ ... documentation}`

### Per-story standard template

Every new story file must:

- Default export `{ title: "<Category>/<ComponentName>" }` (e.g., `"Buttons/CloneButton"`)
- Wrap stories in `<ThemeProvider><CoreAdminContext i18nProvider={i18nProvider}>...` (see `src/stories/edit-button.stories.tsx` for the exact wrapper)
- Export at minimum a `Default` story
- Import the component under test by **name** from `@/components/admin` (works after that name is added to `src/components/admin/index.ts`; if no `index.ts` exists, import from the exact file path)

### Per-docs-page standard template

Every new docs page must:

- Frontmatter: `---\ntitle: "<ComponentName>"\n---`
- Opening paragraph (one sentence describing what it does)
- `## Usage` section with a code example
- `## Props` section with a markdown table (columns: Prop | Required | Type | Default | Description)
- One `## \`propName\`` section per prop with at least 1-3 paragraphs of explanation

See `docs/src/content/docs/EditButton.md` as the canonical example.

### Per-component verification

After implementing a single component:

```bash
pnpm typecheck      # must pass
pnpm lint           # must pass
pnpm vitest run --browser.headless src/stories/<kebab>.stories.tsx   # story renders without error
```

After implementing all components in a task:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

### Per-component commit

After a single component lands (component + story + docs + registry entry), commit:

```bash
git add src/components/admin/<kebab>.tsx src/stories/<kebab>.stories.tsx docs/src/content/docs/<PascalCase>.md registry.json
git commit -m "feat: add <ComponentName> for ra-ui-materialui parity

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Registry update mechanic

Open `registry.json`. Find the `"files"` array inside the `"admin"` item (around line 60-560). Add new entries **alphabetically** by path:

```json
{
  "path": "src/components/admin/<kebab>.tsx",
  "type": "registry:component"
},
```

After adding all entries for a task, run `node ./scripts/build_registry.mjs` to verify the registry builds without errors.

---

## Task 0: Pre-flight setup

**Files:**

- Modify: `package.json`
- Run: `pnpm install`

- [ ] **Step 1: Install DOMPurify + html-react-parser for safe RichTextField rendering**

```bash
pnpm add dompurify html-react-parser
pnpm add -D @types/dompurify
```

- [ ] **Step 2: Verify clean baseline**

```bash
pnpm typecheck
pnpm lint
pnpm test
```

All three must pass before starting Wave 1. If any fail, fix or revert before proceeding.

- [ ] **Step 3: Commit lockfile + package.json updates**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add dompurify + html-react-parser for RichTextField

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Wave 1 — leaf components (5 subagents dispatched in parallel)

All five tasks below have no inter-dependencies and operate on different files. Dispatch them simultaneously.

### Task 1a: Missing buttons + named re-exports

**Files to create (8):**

| File                                              | Component                                                                                           | Upstream reference                                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/components/admin/clone-button.tsx`           | `CloneButton`                                                                                       | `…/button/CloneButton.tsx`                                                                                               |
| `src/components/admin/list-button.tsx`            | `ListButton`                                                                                        | upstream has no separate `ListButton.tsx` — model on `…/button/EditButton.tsx`, navigate to list route                   |
| `src/components/admin/prev-next-buttons.tsx`      | `PrevNextButtons`                                                                                   | `…/button/PrevNextButtons.tsx`                                                                                           |
| `src/components/admin/save-button.tsx`            | `SaveButton`                                                                                        | extracted from `src/components/admin/form.tsx` (currently lines 168-289). Re-export from `form.tsx` for backward-compat. |
| `src/components/admin/refresh-icon-button.tsx`    | `RefreshIconButton`                                                                                 | `…/button/RefreshIconButton.tsx`                                                                                         |
| `src/components/admin/skip-navigation-button.tsx` | `SkipNavigationButton`                                                                              | `…/button/SkipNavigationButton.tsx`                                                                                      |
| `src/components/admin/update-button.tsx`          | `UpdateButton`, `UpdateWithConfirmButton`, `UpdateWithUndoButton` (3 exports in 1 file)             | `…/button/UpdateButton.tsx`, `…/button/UpdateWithConfirmButton.tsx`, `…/button/UpdateWithUndoButton.tsx`                 |
| `src/components/admin/bulk-update-button.tsx`     | `BulkUpdateButton`, `BulkUpdateWithConfirmButton`, `BulkUpdateWithUndoButton` (3 exports in 1 file) | `…/button/BulkUpdateButton.tsx`, `…/button/BulkUpdateWithConfirmButton.tsx`, `…/button/BulkUpdateWithUndoButton.tsx`     |

**Files to modify:**

| File                                          | Change                                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/admin/delete-button.tsx`      | Add named exports `DeleteWithConfirmButton`, `DeleteWithUndoButton` (4-line wrappers fixing `mutationMode='pessimistic'` and `mutationMode='undoable'` respectively) |
| `src/components/admin/bulk-delete-button.tsx` | Add named exports `BulkDeleteWithConfirmButton`, `BulkDeleteWithUndoButton` (same pattern)                                                                           |
| `src/components/admin/form.tsx`               | Move `SaveButton` body (lines 168-289) into `save-button.tsx`. Re-export from `form.tsx`: `export { SaveButton } from "./save-button"`.                              |

**Convention pattern to follow:** `src/components/admin/edit-button.tsx` (an existing button using identical hooks).

- [ ] **Step 1: Read references**
  - Read `src/components/admin/edit-button.tsx` (convention model)
  - Read `src/components/admin/delete-button.tsx` (mutationMode pattern)
  - Read upstream `…/button/CloneButton.tsx`, `…/button/UpdateButton.tsx`, `…/button/UpdateWithConfirmButton.tsx`, `…/button/UpdateWithUndoButton.tsx`, `…/button/SaveButton.tsx`, `…/button/PrevNextButtons.tsx`, `…/button/RefreshIconButton.tsx`, `…/button/SkipNavigationButton.tsx`

- [ ] **Step 2: Extract SaveButton**

Move the SaveButton component currently in `src/components/admin/form.tsx` (lines 168-289) to a new file `src/components/admin/save-button.tsx`. Keep types and props identical. In `form.tsx`, replace the SaveButton definition with `export { SaveButton, type SaveButtonProps } from "./save-button";` immediately before the existing export block.

Verify nothing else in the repo imports `SaveButton` from a non-`form.tsx` / non-`admin` path:

```bash
grep -rn "SaveButton" src/ docs/ --include='*.tsx' --include='*.ts' --include='*.md' | grep -v "@/components/admin"
```

If the only matches are the new file or the form.tsx re-export, you're good.

- [ ] **Step 3: Create CloneButton**

Pattern: same as `EditButton`, but the link target is the `create` route with the current record's data passed via React Router's `state`.

```tsx
import { buttonVariants } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { RaRecord } from "ra-core";
import {
  useRecordContext,
  useResourceContext,
  useResourceTranslation,
  useCreatePath,
  useGetResourceLabel,
} from "ra-core";
import { Link } from "react-router";

export type CloneButtonProps = {
  record?: Partial<RaRecord>;
  resource?: string;
  label?: string;
  className?: string;
};

export const CloneButton = (props: CloneButtonProps) => {
  const resource = useResourceContext(props);
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  const getResourceLabel = useGetResourceLabel();
  const label = useResourceTranslation({
    resourceI18nKey: resource
      ? `resources.${resource}.action.clone`
      : undefined,
    baseI18nKey: "ra.action.clone",
    options: { name: resource ? getResourceLabel(resource, 1) : undefined },
    userText: props.label,
  });
  const pathname = createPath({ resource, type: "create" });
  const { id, ...recordWithoutId } = record ?? {};
  return (
    <Link
      className={buttonVariants({ variant: "outline" })}
      to={{ pathname }}
      state={{ record: recordWithoutId }}
      aria-label={typeof label === "string" ? label : undefined}
    >
      <Copy />
      {label}
    </Link>
  );
};
```

- [ ] **Step 4: Create ListButton**

Same pattern, target = `list` route, icon = `<List />` from lucide.

```tsx
import { buttonVariants } from "@/components/ui/button";
import { List as ListIcon } from "lucide-react";
import {
  useResourceContext,
  useResourceTranslation,
  useCreatePath,
  useGetResourceLabel,
} from "ra-core";
import { Link } from "react-router";

export type ListButtonProps = {
  resource?: string;
  label?: string;
  className?: string;
};

export const ListButton = (props: ListButtonProps) => {
  const resource = useResourceContext(props);
  const createPath = useCreatePath();
  const getResourceLabel = useGetResourceLabel();
  const label = useResourceTranslation({
    resourceI18nKey: resource ? `resources.${resource}.action.list` : undefined,
    baseI18nKey: "ra.action.list",
    options: { name: resource ? getResourceLabel(resource, 2) : undefined },
    userText: props.label,
  });
  const pathname = createPath({ resource, type: "list" });
  return (
    <Link className={buttonVariants({ variant: "outline" })} to={pathname}>
      <ListIcon />
      {label}
    </Link>
  );
};
```

- [ ] **Step 5: Create PrevNextButtons**

Use `usePrevNextController` from `ra-core` (it exists). Render two side-by-side `<Link>` buttons with `<ChevronLeft />` and `<ChevronRight />`. Show a small "n of total" indicator between them. Read the upstream `PrevNextButtons.tsx` for exact prop signature (`filter`, `sort`, `linkType`, `storeKey`, `limit`).

- [ ] **Step 6: Create RefreshIconButton**

```tsx
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRefresh, useTranslate } from "ra-core";

export type RefreshIconButtonProps = {
  className?: string;
  label?: string;
};

export const RefreshIconButton = (props: RefreshIconButtonProps) => {
  const refresh = useRefresh();
  const translate = useTranslate();
  const label = props.label ?? translate("ra.action.refresh", { _: "Refresh" });
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => refresh()}
      aria-label={label}
      className={props.className}
    >
      <RefreshCw />
    </Button>
  );
};
```

- [ ] **Step 7: Create SkipNavigationButton**

A11y skip-link to main content. Renders an `<a href="#main-content">` styled to only appear on focus. Reference upstream for label/translation key (`ra.navigation.skip_nav`).

- [ ] **Step 8: Create UpdateButton + the two named variants in the same file**

```tsx
// update-button.tsx
import { Button } from "@/components/ui/button";
import {
  useNotify,
  useRecordContext,
  useResourceContext,
  useResourceTranslation,
  useUpdate,
  type MutationMode,
} from "ra-core";
import { Pencil } from "lucide-react";

export type UpdateButtonProps = {
  resource?: string;
  data: Record<string, unknown>;
  label?: string;
  icon?: React.ReactNode;
  mutationMode?: MutationMode; // 'pessimistic' | 'optimistic' | 'undoable'
};

export const UpdateButton = (props: UpdateButtonProps) => {
  const {
    data,
    mutationMode = "undoable",
    icon = <Pencil />,
    label: labelProp,
  } = props;
  const resource = useResourceContext(props);
  const record = useRecordContext();
  const notify = useNotify();
  const [update, { isPending }] = useUpdate();
  const label = useResourceTranslation({
    resourceI18nKey: resource
      ? `resources.${resource}.action.update`
      : undefined,
    baseI18nKey: "ra.action.update",
    userText: labelProp,
  });
  const onClick = () => {
    if (!record?.id || !resource) return;
    update(resource, { id: record.id, data, previousData: record }, {
      mutationMode,
      onSuccess: () =>
        notify("ra.notification.updated", {
          type: "success",
          messageArgs: { smart_count: 1 },
        }),
      onError: (error) =>
        notify(typeof error === "string" ? error : (error as Error).message, {
          type: "error",
        }),
    } as never);
  };
  return (
    <Button variant="outline" onClick={onClick} disabled={isPending}>
      {icon}
      {label}
    </Button>
  );
};

export const UpdateWithConfirmButton = (props: UpdateButtonProps) => (
  <UpdateButton {...props} mutationMode="pessimistic" />
);

export const UpdateWithUndoButton = (props: UpdateButtonProps) => (
  <UpdateButton {...props} mutationMode="undoable" />
);
```

(The "With Confirm" variant in upstream actually opens a confirm dialog before firing the mutation. Subagent: read upstream `UpdateWithConfirmButton.tsx` and wrap the click flow with a `<Confirm>` dialog using `src/components/admin/confirm.tsx`. The skeleton above is a starting point.)

- [ ] **Step 9: Create BulkUpdateButton + variants (same file pattern as Step 8)**

Same as UpdateButton but uses `useUpdateMany` and reads `useListContext().selectedIds`. Lives in the bulk-actions-toolbar context. Reference upstream `BulkUpdateButton.tsx`.

- [ ] **Step 10: Add DeleteWithConfirmButton / DeleteWithUndoButton named exports**

Open `src/components/admin/delete-button.tsx`. After the existing `DeleteButton` export, append:

```tsx
export const DeleteWithConfirmButton = (
  props: Omit<DeleteButtonProps, "mutationMode">,
) => <DeleteButton {...props} mutationMode="pessimistic" />;

export const DeleteWithUndoButton = (
  props: Omit<DeleteButtonProps, "mutationMode">,
) => <DeleteButton {...props} mutationMode="undoable" />;
```

(Subagent: verify that `delete-button.tsx` already accepts a `mutationMode` prop. If not, add it as an optional prop on `DeleteButtonProps` and thread it into `useDelete`.)

- [ ] **Step 11: Add BulkDeleteWithConfirmButton / BulkDeleteWithUndoButton named exports**

Open `src/components/admin/bulk-delete-button.tsx`. Same pattern as Step 10.

- [ ] **Step 12: Create stories for each new button**

One per new component: `src/stories/clone-button.stories.tsx`, etc. Mirror the structure of `src/stories/edit-button.stories.tsx`. Each story exports a `Default` and (where relevant) a `Disabled` variant.

For the same-file siblings (UpdateButton family, BulkUpdate family), one story file per file — export `Default`, `WithConfirm`, `WithUndo` from `src/stories/update-button.stories.tsx`.

- [ ] **Step 13: Create docs pages**

Files (8):

- `docs/src/content/docs/CloneButton.md`
- `docs/src/content/docs/ListButton.md`
- `docs/src/content/docs/PrevNextButtons.md`
- `docs/src/content/docs/SaveButton.md`
- `docs/src/content/docs/RefreshIconButton.md`
- `docs/src/content/docs/SkipNavigationButton.md`
- `docs/src/content/docs/UpdateButton.md` (covers UpdateButton + WithConfirm + WithUndo)
- `docs/src/content/docs/BulkUpdateButton.md` (same)

Also update `docs/src/content/docs/DeleteButton.md` and `docs/src/content/docs/BulkDeleteButton.md` (if they exist) to document the `WithConfirm`/`WithUndo` named variants.

Pattern: copy `docs/src/content/docs/EditButton.md` as template.

- [ ] **Step 14: Update registry.json**

Add new entries to the `files` array inside the `admin` item, alphabetically:

```json
{ "path": "src/components/admin/bulk-update-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/clone-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/list-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/prev-next-buttons.tsx", "type": "registry:component" },
{ "path": "src/components/admin/refresh-icon-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/save-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/skip-navigation-button.tsx", "type": "registry:component" },
{ "path": "src/components/admin/update-button.tsx", "type": "registry:component" }
```

- [ ] **Step 15: Verify**

```bash
pnpm typecheck
pnpm lint
pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs
```

- [ ] **Step 16: Commit**

```bash
git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port missing buttons from ra-ui-materialui

Adds CloneButton, ListButton, PrevNextButtons, SaveButton (extracted from form),
RefreshIconButton, SkipNavigationButton, UpdateButton + variants, BulkUpdateButton +
variants, plus DeleteWithConfirmButton/DeleteWithUndoButton and BulkDelete variants
as named re-exports.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1b: Missing fields

**Files to create (6):**

| File                                           | Component           | Upstream reference              |
| ---------------------------------------------- | ------------------- | ------------------------------- |
| `src/components/admin/chip-field.tsx`          | `ChipField`         | `…/field/ChipField.tsx`         |
| `src/components/admin/function-field.tsx`      | `FunctionField`     | `…/field/FunctionField.tsx`     |
| `src/components/admin/reference-one-field.tsx` | `ReferenceOneField` | `…/field/ReferenceOneField.tsx` |
| `src/components/admin/rich-text-field.tsx`     | `RichTextField`     | `…/field/RichTextField.tsx`     |
| `src/components/admin/text-array-field.tsx`    | `TextArrayField`    | `…/field/TextArrayField.tsx`    |
| `src/components/admin/wrapper-field.tsx`       | `WrapperField`      | `…/field/WrapperField.tsx`      |

**Convention pattern:** `src/components/admin/email-field.tsx` and `src/components/admin/badge-field.tsx`.

- [ ] **Step 1: Read references**

- Read `src/components/admin/email-field.tsx` (simple field convention model)
- Read `src/components/admin/badge-field.tsx` (uses shadcn `<Badge>`)
- Read `src/components/admin/array-field.tsx` (provides ListContext from array — TextArrayField context model)
- Read upstream files

- [ ] **Step 2: Create ChipField**

```tsx
import { Badge } from "@/components/ui/badge";
import { useFieldValue, type FieldProps } from "ra-core";
import { cn } from "@/lib/utils";

export type ChipFieldProps = FieldProps & {
  className?: string;
  emptyText?: string;
};

export const ChipField = (props: ChipFieldProps) => {
  const value = useFieldValue(props);
  if (value == null || value === "") {
    return props.emptyText ? (
      <span className="text-muted-foreground">{props.emptyText}</span>
    ) : null;
  }
  return (
    <Badge variant="secondary" className={cn(props.className)}>
      {String(value)}
    </Badge>
  );
};
```

- [ ] **Step 3: Create FunctionField**

```tsx
import { useRecordContext, type RaRecord } from "ra-core";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FunctionFieldProps<RecordType extends RaRecord = RaRecord> = {
  source?: string;
  label?: string;
  render: (record: RecordType) => ReactNode;
  className?: string;
};

export const FunctionField = <RecordType extends RaRecord = RaRecord>(
  props: FunctionFieldProps<RecordType>,
) => {
  const record = useRecordContext<RecordType>();
  if (!record) return null;
  return <span className={cn(props.className)}>{props.render(record)}</span>;
};
```

- [ ] **Step 4: Create ReferenceOneField**

Reverse-one-to-one reference. Uses `useReferenceOneFieldController` from `ra-core`. Reference `…/field/ReferenceOneField.tsx` for exact prop signature.

```tsx
import type { ReactNode } from "react";
import {
  RecordContextProvider,
  useReferenceOneFieldController,
  type UseReferenceOneFieldControllerParams,
} from "ra-core";

export type ReferenceOneFieldProps = UseReferenceOneFieldControllerParams & {
  children: ReactNode;
  empty?: ReactNode;
  loading?: ReactNode;
};

export const ReferenceOneField = (props: ReferenceOneFieldProps) => {
  const { children, empty = null, loading = null, ...controllerProps } = props;
  const { referenceRecord, isPending } =
    useReferenceOneFieldController(controllerProps);
  if (isPending) return <>{loading}</>;
  if (!referenceRecord) return <>{empty}</>;
  return (
    <RecordContextProvider value={referenceRecord}>
      {children}
    </RecordContextProvider>
  );
};
```

- [ ] **Step 5: Create RichTextField (with safe HTML rendering)**

**Behavior requirements:**

- Displays HTML content stored in a record field
- Sanitizes input via DOMPurify before rendering — non-negotiable
- Supports a `stripTags` prop that renders only plain text (no markup)
- Supports an `emptyText` prop shown when the field is null/empty

**Approach:** parse the DOMPurify-sanitized HTML into a React element tree using `html-react-parser`, then render the tree. This avoids React's HTML-injection escape hatches entirely while still rendering rich-text markup correctly.

The `dompurify` and `html-react-parser` packages were installed in Task 0.

**Implementation outline** (subagent: fill in the React component shell based on the upstream `RichTextField.tsx`):

1. Import `DOMPurify` from `"dompurify"` and `parse` from `"html-react-parser"`.
2. Import `useFieldValue` and `FieldProps` from `"ra-core"`.
3. Read the value with `useFieldValue`.
4. If `value` is nullish/empty: render `props.emptyText` inside a muted-foreground span, or return null.
5. If `props.stripTags` is true: render `<span className={cn(props.className)}>{DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] })}</span>` — the sanitizer with no allowed tags returns plain text, which React renders as a child string (no HTML injection involved).
6. Otherwise: render `<span className={cn(props.className)}>{parse(DOMPurify.sanitize(String(value)))}</span>` — the sanitized string is parsed back into JSX elements by `html-react-parser`, so no escape hatch is used.
7. Export `RichTextFieldProps` type extending `FieldProps` with `className?: string`, `emptyText?: string`, `stripTags?: boolean`.

Reference the upstream `…/field/RichTextField.tsx` for the exact prop signature.

- [ ] **Step 6: Create TextArrayField**

```tsx
import { Badge } from "@/components/ui/badge";
import { useFieldValue, type FieldProps } from "ra-core";
import { cn } from "@/lib/utils";

export type TextArrayFieldProps = FieldProps & {
  className?: string;
};

export const TextArrayField = (props: TextArrayFieldProps) => {
  const value = useFieldValue(props);
  if (!Array.isArray(value)) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", props.className)}>
      {value.map((v, i) => (
        <Badge key={`${i}-${String(v)}`} variant="secondary">
          {String(v)}
        </Badge>
      ))}
    </div>
  );
};
```

- [ ] **Step 7: Create WrapperField**

A pass-through with a `source` prop so it participates in field-context (sortable headers, etc.):

```tsx
import type { ReactNode } from "react";

export type WrapperFieldProps = {
  source?: string;
  label?: string;
  sortBy?: string;
  sortByOrder?: "ASC" | "DESC";
  children: ReactNode;
};

export const WrapperField = ({ children }: WrapperFieldProps) => (
  <>{children}</>
);
```

- [ ] **Step 8: Create stories for each (6 files)**

Pattern: copy `src/stories/email-field.stories.tsx`. Each story sets up a `RecordContextProvider` (or `ListContextProvider` for ReferenceOneField), passes test data, renders the field.

- [ ] **Step 9: Create docs pages (6 files)**

- `docs/src/content/docs/ChipField.md`
- `docs/src/content/docs/FunctionField.md`
- `docs/src/content/docs/ReferenceOneField.md`
- `docs/src/content/docs/RichTextField.md`
- `docs/src/content/docs/TextArrayField.md`
- `docs/src/content/docs/WrapperField.md`

Pattern: copy `docs/src/content/docs/EmailField.md`.

- [ ] **Step 10: Update registry.json**

Add 6 entries to the `files` array, alphabetically:

```json
{ "path": "src/components/admin/chip-field.tsx", "type": "registry:component" },
{ "path": "src/components/admin/function-field.tsx", "type": "registry:component" },
{ "path": "src/components/admin/reference-one-field.tsx", "type": "registry:component" },
{ "path": "src/components/admin/rich-text-field.tsx", "type": "registry:component" },
{ "path": "src/components/admin/text-array-field.tsx", "type": "registry:component" },
{ "path": "src/components/admin/wrapper-field.tsx", "type": "registry:component" }
```

Also add `"dompurify"` and `"html-react-parser"` to the `admin` item's `dependencies` array.

- [ ] **Step 11: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs
```

- [ ] **Step 12: Commit**

```bash
git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port missing fields from ra-ui-materialui

Adds ChipField, FunctionField, ReferenceOneField, RichTextField (sanitized
via DOMPurify + html-react-parser), TextArrayField, WrapperField.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1c: Missing inputs (set A — choice-style)

**Files to create (5):**

| File                                              | Component              | Upstream reference                                              |
| ------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| `src/components/admin/checkbox-group-input.tsx`   | `CheckboxGroupInput`   | `…/input/CheckboxGroupInput.tsx` + `CheckboxGroupInputItem.tsx` |
| `src/components/admin/password-input.tsx`         | `PasswordInput`        | `…/input/PasswordInput.tsx`                                     |
| `src/components/admin/nullable-boolean-input.tsx` | `NullableBooleanInput` | `…/input/NullableBooleanInput.tsx`                              |
| `src/components/admin/time-input.tsx`             | `TimeInput`            | `…/input/TimeInput.tsx`                                         |
| `src/components/admin/select-array-input.tsx`     | `SelectArrayInput`     | `…/input/SelectArrayInput.tsx`                                  |

**Convention patterns:** `src/components/admin/radio-button-group-input.tsx`, `text-input.tsx`, `select-input.tsx`, `date-time-input.tsx`.

- [ ] **Step 1: Read references**

- Read `src/components/admin/radio-button-group-input.tsx` (for CheckboxGroupInput pattern)
- Read `src/components/admin/select-input.tsx` (for SelectArrayInput pattern)
- Read `src/components/admin/date-time-input.tsx` (for TimeInput pattern)
- Read `src/components/admin/text-input.tsx` (for PasswordInput / NullableBooleanInput input wiring)
- Read upstream files

- [ ] **Step 2: Create CheckboxGroupInput**

Use shadcn `<Checkbox>` primitive. Each choice renders as `<Checkbox checked={…} onCheckedChange={…} />` paired with a label. Manage selected ids array via `useInput`.

```tsx
import type { ChoicesProps, CommonInputProps } from "ra-core";
import { useChoices, useChoicesContext, useInput } from "ra-core";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FormError, FormField, FormLabel } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";

export type CheckboxGroupInputProps = CommonInputProps &
  ChoicesProps & {
    row?: boolean;
  };

export const CheckboxGroupInput = (props: CheckboxGroupInputProps) => {
  const { source, helperText, row = false, label, ...rest } = props;
  const choices =
    useChoicesContext({ choices: props.choices }).allChoices ??
    props.choices ??
    [];
  const { getChoiceText, getChoiceValue } = useChoices(props);
  const { field, fieldState, isRequired } = useInput({
    source: source!,
    ...rest,
  });
  const value: Array<string | number> = Array.isArray(field.value)
    ? field.value
    : [];
  const toggle = (val: string | number) => {
    const next = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    field.onChange(next);
  };
  return (
    <FormField>
      <FormLabel htmlFor={source}>
        {label ?? source}
        {isRequired && " *"}
      </FormLabel>
      <div className={cn("flex gap-3", row ? "flex-row" : "flex-col")}>
        {choices.map((choice) => {
          const choiceValue = getChoiceValue(choice);
          const choiceText = getChoiceText(choice);
          return (
            <Label
              key={String(choiceValue)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={value.includes(choiceValue)}
                onCheckedChange={() => toggle(choiceValue)}
              />
              <span>{choiceText}</span>
            </Label>
          );
        })}
      </div>
      <InputHelperText
        helperText={helperText}
        error={fieldState.error?.message}
      />
      <FormError error={fieldState.error?.message} />
    </FormField>
  );
};
```

- [ ] **Step 3: Create PasswordInput**

A `TextInput` variant with `type="password"` plus a visibility toggle. Add an `initiallyVisible` boolean prop.

```tsx
import { useState } from "react";
import { TextInput, type TextInputProps } from "@/components/admin/text-input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PasswordInputProps = Omit<TextInputProps, "type"> & {
  initiallyVisible?: boolean;
};

export const PasswordInput = ({
  initiallyVisible = false,
  ...rest
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(initiallyVisible);
  return (
    <div className="relative">
      <TextInput {...rest} type={visible ? "text" : "password"} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-7"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};
```

- [ ] **Step 4: Create NullableBooleanInput**

A 3-option Select: True / False / Null. Map null ⇄ a sentinel value.

```tsx
import type { CommonInputProps } from "ra-core";
import { useInput, useTranslate } from "ra-core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError, FormField, FormLabel } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";

export type NullableBooleanInputProps = CommonInputProps & {
  nullLabel?: string;
  trueLabel?: string;
  falseLabel?: string;
};

const NULL_SENTINEL = "__null__";
const TRUE_SENTINEL = "__true__";
const FALSE_SENTINEL = "__false__";

const toSentinel = (v: unknown) =>
  v == null ? NULL_SENTINEL : v ? TRUE_SENTINEL : FALSE_SENTINEL;
const fromSentinel = (s: string) =>
  s === NULL_SENTINEL ? null : s === TRUE_SENTINEL ? true : false;

export const NullableBooleanInput = (props: NullableBooleanInputProps) => {
  const { source, helperText, label, nullLabel, trueLabel, falseLabel } = props;
  const translate = useTranslate();
  const { field, fieldState, isRequired } = useInput({
    source: source!,
    ...props,
  });
  return (
    <FormField>
      <FormLabel htmlFor={source}>
        {label ?? source}
        {isRequired && " *"}
      </FormLabel>
      <Select
        value={toSentinel(field.value)}
        onValueChange={(v) => field.onChange(fromSentinel(v))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NULL_SENTINEL}>
            {nullLabel ?? translate("ra.boolean.null", { _: "" })}
          </SelectItem>
          <SelectItem value={TRUE_SENTINEL}>
            {trueLabel ?? translate("ra.boolean.true", { _: "Yes" })}
          </SelectItem>
          <SelectItem value={FALSE_SENTINEL}>
            {falseLabel ?? translate("ra.boolean.false", { _: "No" })}
          </SelectItem>
        </SelectContent>
      </Select>
      <InputHelperText
        helperText={helperText}
        error={fieldState.error?.message}
      />
      <FormError error={fieldState.error?.message} />
    </FormField>
  );
};
```

- [ ] **Step 5: Create TimeInput**

HTML `type="time"` input wrapped the same way as `DateTimeInput`. Reference `src/components/admin/date-time-input.tsx` and mirror exactly with `type="time"`.

- [ ] **Step 6: Create SelectArrayInput**

Multi-select dropdown. shadcn doesn't ship a native multi-select Select — render a list of `<Checkbox>` rows inside a `<Popover>` triggered by a button. The button displays selected values as comma-separated text or as small badges. Reference `src/components/admin/autocomplete-array-input.tsx` for the multi-select-in-popover pattern (the difference is SelectArrayInput is **not** searchable).

- [ ] **Step 7: Create 5 stories**

`src/stories/checkbox-group-input.stories.tsx`, `password-input.stories.tsx`, `nullable-boolean-input.stories.tsx`, `time-input.stories.tsx`, `select-array-input.stories.tsx`. Pattern: `src/stories/radio-button-group-input.stories.tsx`.

- [ ] **Step 8: Create 5 docs pages**

`CheckboxGroupInput.md`, `PasswordInput.md`, `NullableBooleanInput.md`, `TimeInput.md`, `SelectArrayInput.md`. Pattern: `RadioButtonGroupInput.md`.

- [ ] **Step 9: Update registry.json**

Add 5 entries alphabetically.

- [ ] **Step 10: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs
```

- [ ] **Step 11: Commit**

```bash
git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port choice-style inputs from ra-ui-materialui

Adds CheckboxGroupInput, PasswordInput, NullableBooleanInput, TimeInput,
SelectArrayInput.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1d: Missing inputs (set B — file + resettable)

**Files to create (2):**

| File                                             | Component             | Upstream reference                                       |
| ------------------------------------------------ | --------------------- | -------------------------------------------------------- |
| `src/components/admin/image-input.tsx`           | `ImageInput`          | `…/input/ImageInput.tsx`, `…/input/ImageInputPreview.ts` |
| `src/components/admin/resettable-text-input.tsx` | `ResettableTextInput` | `…/input/ResettableTextField.tsx`                        |

**Convention patterns:** `src/components/admin/file-input.tsx`, `text-input.tsx`.

- [ ] **Step 1: Read references**
- Read `src/components/admin/file-input.tsx` end-to-end
- Read `src/components/admin/image-field.tsx`
- Read `src/components/admin/text-input.tsx`
- Read upstream `…/input/ImageInput.tsx`

- [ ] **Step 2: Create ImageInput**

ImageInput is **almost identical** to FileInput. Differences:

- Default `accept` prop = `{ "image/*": [] }` instead of unset
- Default preview = `<img>` thumbnails instead of file-name list
- Same dropzone behavior

Implementation: either copy file-input.tsx structure with image defaults, or compose: `<FileInput accept={{ "image/*": [] }}>{children ?? <DefaultImagePreview />}</FileInput>`.

- [ ] **Step 3: Create ResettableTextInput**

```tsx
import { TextInput, type TextInputProps } from "@/components/admin/text-input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useInput } from "ra-core";

export type ResettableTextInputProps = TextInputProps & {
  resettable?: boolean;
};

export const ResettableTextInput = ({
  resettable = true,
  ...rest
}: ResettableTextInputProps) => {
  const { field } = useInput({ source: rest.source!, ...rest });
  return (
    <div className="relative">
      <TextInput {...rest} />
      {resettable && field.value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-7"
          onClick={() => field.onChange("")}
          aria-label="Clear"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
};
```

- [ ] **Step 4: Create 2 stories**

`image-input.stories.tsx`, `resettable-text-input.stories.tsx`. Pattern: `file-input.stories.tsx` / `text-input.stories.tsx`.

- [ ] **Step 5: Create 2 docs pages**

`ImageInput.md`, `ResettableTextInput.md`.

- [ ] **Step 6: Update registry.json**

Add 2 entries.

- [ ] **Step 7: Verify + Commit**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs

git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port ImageInput and ResettableTextInput from ra-ui-materialui

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1e: Misc atom components

**Files to create (7):**

| File                                             | Component              | Upstream reference                 |
| ------------------------------------------------ | ---------------------- | ---------------------------------- |
| `src/components/admin/empty.tsx`                 | `Empty`                | `…/list/Empty.tsx`                 |
| `src/components/admin/list-no-results.tsx`       | `ListNoResults`        | `…/list/ListNoResults.tsx`         |
| `src/components/admin/list-actions.tsx`          | `ListActions`          | `…/list/ListActions.tsx`           |
| `src/components/admin/list-toolbar.tsx`          | `ListToolbar`          | `…/list/ListToolbar.tsx`           |
| `src/components/admin/link.tsx`                  | `Link` (typed wrapper) | `…/Link.tsx`                       |
| `src/components/admin/loading-indicator.tsx`     | `LoadingIndicator`     | `…/layout/LoadingIndicator.tsx`    |
| `src/components/admin/sidebar-toggle-button.tsx` | `SidebarToggleButton`  | `…/layout/SidebarToggleButton.tsx` |

**Convention patterns:** `src/components/admin/spinner.tsx`, `loading.tsx`, `breadcrumb.tsx`.

- [ ] **Step 1: Read references**

- Read each of: `src/components/admin/spinner.tsx`, `loading.tsx`, `not-found.tsx`, `filter-form.tsx`, `create-button.tsx`, `export-button.tsx`
- Read upstream files

- [ ] **Step 2: Create Empty**

Shown when a List query returns 0 records and there are **no active filters**.

```tsx
import { useGetResourceLabel, useResourceContext, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { Inbox } from "lucide-react";

export type EmptyProps = {
  resource?: string;
  className?: string;
};

export const Empty = (props: EmptyProps) => {
  const resource = useResourceContext(props);
  const getResourceLabel = useGetResourceLabel();
  const translate = useTranslate();
  const resourceName = resource ? getResourceLabel(resource, 0) : "";
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="size-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        {translate("ra.page.empty", {
          name: resourceName,
          _: `No ${resourceName} yet.`,
        })}
      </h2>
      <p className="text-muted-foreground mb-4">
        {translate("ra.page.invite", { _: "Do you want to add one?" })}
      </p>
      <CreateButton />
    </div>
  );
};
```

- [ ] **Step 3: Create ListNoResults**

Shown when filters yield 0 results.

```tsx
import { useListContext, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";

export const ListNoResults = () => {
  const { setFilters, filterValues } = useListContext();
  const translate = useTranslate();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>
        {translate("ra.navigation.no_filtered_results", {
          _: "No results match the current filters.",
        })}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setFilters({}, {})}
        >
          {translate("ra.action.clear_input_value", { _: "Clear filters" })}
        </Button>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Create ListActions**

```tsx
import type { ReactNode } from "react";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";

export type ListActionsProps = {
  children?: ReactNode;
};

export const ListActions = ({ children }: ListActionsProps) => (
  <div className="flex gap-2 justify-end">
    {children ?? (
      <>
        <CreateButton />
        <ExportButton />
      </>
    )}
  </div>
);
```

- [ ] **Step 5: Create ListToolbar**

```tsx
import type { ReactNode } from "react";
import { ListActions } from "@/components/admin/list-actions";
import { FilterForm } from "@/components/admin/filter-form";
import { cn } from "@/lib/utils";

export type ListToolbarProps = {
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export const ListToolbar = ({
  filters,
  actions,
  className,
}: ListToolbarProps) => (
  <div className={cn("flex items-start justify-between gap-2 my-2", className)}>
    <div className="flex-1">{filters ?? <FilterForm />}</div>
    <div>{actions ?? <ListActions />}</div>
  </div>
);
```

- [ ] **Step 6: Create Link**

```tsx
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "react-router";

export type LinkProps = RouterLinkProps;

export const Link = (props: LinkProps) => <RouterLink {...props} />;
```

- [ ] **Step 7: Create LoadingIndicator**

Uses `useLoading` from `ra-core` to show when a fetch is in flight.

```tsx
import { useLoading, useTranslate } from "ra-core";
import { Loader2 } from "lucide-react";

export const LoadingIndicator = () => {
  const loading = useLoading();
  const translate = useTranslate();
  if (!loading) return null;
  return (
    <Loader2
      className="animate-spin size-4"
      aria-label={translate("ra.page.loading", { _: "Loading" })}
    />
  );
};
```

- [ ] **Step 8: Create SidebarToggleButton**

```tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SidebarToggleButtonProps = {
  className?: string;
};

export const SidebarToggleButton = ({
  className,
}: SidebarToggleButtonProps) => (
  <SidebarTrigger className={cn("scale-125 sm:scale-100", className)} />
);
```

- [ ] **Step 9: Create 7 stories**

`empty.stories.tsx`, `list-no-results.stories.tsx`, `list-actions.stories.tsx`, `list-toolbar.stories.tsx`, `link.stories.tsx`, `loading-indicator.stories.tsx`, `sidebar-toggle-button.stories.tsx`.

- [ ] **Step 10: Create 7 docs pages**

- [ ] **Step 11: Update registry.json**

Add 7 entries.

- [ ] **Step 12: Verify + Commit**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs

git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port misc atom components from ra-ui-materialui

Adds Empty, ListNoResults, ListActions, ListToolbar, Link, LoadingIndicator,
SidebarToggleButton.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Wave 2 — composites (2 subagents dispatched in parallel)

Verify Wave 1 is fully merged before dispatching Wave 2.

### Task 2a: Filter sidebar family

**Files to create (6):**

| File                                           | Component           | Upstream reference                                            |
| ---------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| `src/components/admin/filter-list.tsx`         | `FilterList`        | `…/list/filter/FilterList.tsx`                                |
| `src/components/admin/filter-list-item.tsx`    | `FilterListItem`    | `…/list/filter/FilterListItem.tsx`                            |
| `src/components/admin/filter-list-section.tsx` | `FilterListSection` | `…/list/filter/FilterListSection.tsx`                         |
| `src/components/admin/filter-live-form.tsx`    | `FilterLiveForm`    | `…/list/filter/FilterLiveForm.tsx`                            |
| `src/components/admin/filter-live-search.tsx`  | `FilterLiveSearch`  | `…/list/filter/FilterLiveSearch.tsx`                          |
| `src/components/admin/filter-button.tsx`       | `FilterButton`      | `…/list/filter/FilterButton.tsx` + `FilterButtonMenuItem.tsx` |

Note: `src/stories/filter-button.stories.tsx` already exists (orphaned). Honor its API.

**Convention pattern:** `filter-form.tsx`, `saved-queries.tsx`, `search-input.tsx`, `toggle-filter-button.tsx`.

- [ ] **Step 1: Read references**

- Read `src/components/admin/filter-form.tsx`, `saved-queries.tsx`, `search-input.tsx`, `toggle-filter-button.tsx`
- Read `src/stories/filter-button.stories.tsx` (to understand the expected API)
- Read upstream files

- [ ] **Step 2: Create FilterList**

```tsx
import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterListProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export const FilterList = ({
  label,
  icon,
  children,
  defaultOpen = true,
  className,
}: FilterListProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("py-2", className)}>
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium w-full hover:text-foreground/80"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        {icon}
        <span>{label}</span>
      </button>
      {open && <div className="flex flex-col gap-1 pl-6 mt-2">{children}</div>}
    </div>
  );
};
```

- [ ] **Step 3: Create FilterListItem**

```tsx
import { useListContext } from "ra-core";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import isEqual from "lodash/isEqual";

export type FilterListItemProps = {
  label: string;
  value: Record<string, unknown>;
  className?: string;
};

const matches = (
  subset: Record<string, unknown>,
  superset: Record<string, unknown>,
) => Object.entries(subset).every(([k, v]) => isEqual(superset?.[k], v));

export const FilterListItem = ({
  label,
  value,
  className,
}: FilterListItemProps) => {
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const selected = matches(value, filterValues ?? {});
  const toggle = () => {
    if (selected) {
      const next = { ...filterValues };
      Object.keys(value).forEach((k) => {
        delete next[k];
      });
      setFilters(next, displayedFilters);
    } else {
      setFilters({ ...filterValues, ...value }, displayedFilters);
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 text-sm py-1 px-2 rounded text-left",
        selected ? "bg-secondary font-medium" : "hover:bg-secondary/50",
        className,
      )}
    >
      {selected && <Check className="size-3" />}
      <span>{label}</span>
    </button>
  );
};
```

- [ ] **Step 4: Create FilterListSection**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FilterListSectionProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export const FilterListSection = ({
  label,
  children,
  className,
}: FilterListSectionProps) => (
  <section className={cn("flex flex-col gap-1", className)}>
    {label && (
      <h3 className="text-xs uppercase text-muted-foreground tracking-wider mt-2">
        {label}
      </h3>
    )}
    {children}
  </section>
);
```

- [ ] **Step 5: Create FilterLiveForm**

```tsx
import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useListContext } from "ra-core";
import { Form } from "ra-core";

export type FilterLiveFormProps = {
  children: ReactNode;
};

const Subscribe = () => {
  const { setFilters, filterValues, displayedFilters } = useListContext();
  const values = useWatch();
  useEffect(() => {
    setFilters({ ...filterValues, ...values }, displayedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);
  return null;
};

export const FilterLiveForm = ({ children }: FilterLiveFormProps) => {
  const { filterValues } = useListContext();
  return (
    <Form defaultValues={filterValues} onSubmit={() => {}}>
      <Subscribe />
      {children}
    </Form>
  );
};
```

(Subagent: check whether ra-core 5.14+ exports a `FilterLiveForm` and prefer that if so.)

- [ ] **Step 6: Create FilterLiveSearch**

```tsx
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useListContext, useTranslate } from "ra-core";
import { Input } from "@/components/ui/input";

export type FilterLiveSearchProps = {
  source?: string;
  placeholder?: string;
  debounce?: number;
  className?: string;
};

export const FilterLiveSearch = ({
  source = "q",
  placeholder,
  debounce = 500,
  className,
}: FilterLiveSearchProps) => {
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const [value, setValue] = useState<string>(
    String(filterValues?.[source] ?? ""),
  );
  const translate = useTranslate();
  useEffect(() => {
    const t = setTimeout(() => {
      const next = { ...filterValues };
      if (value === "") {
        delete next[source];
      } else {
        next[source] = value;
      }
      setFilters(next, displayedFilters);
    }, debounce);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input
        className="pl-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          placeholder ?? translate("ra.action.search", { _: "Search" })
        }
      />
    </div>
  );
};
```

- [ ] **Step 7: Create FilterButton**

```tsx
import type { ReactElement } from "react";
import { Children } from "react";
import { useListContext, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter as FilterIcon } from "lucide-react";

export type FilterButtonProps = {
  filters: ReactElement[];
  className?: string;
};

export const FilterButton = ({ filters, className }: FilterButtonProps) => {
  const { displayedFilters = {}, showFilter, hideFilter } = useListContext();
  const translate = useTranslate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <FilterIcon className="size-4 mr-1" />
          {translate("ra.action.add_filter", { _: "Add filter" })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Children.map(filters, (filter) => {
          const source = (filter.props as { source: string }).source;
          const label = (filter.props as { label?: string }).label ?? source;
          const checked = !!displayedFilters[source];
          return (
            <DropdownMenuCheckboxItem
              key={source}
              checked={checked}
              onCheckedChange={(v) =>
                v ? showFilter(source) : hideFilter(source)
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

(Subagent: verify against `src/stories/filter-button.stories.tsx` — match whatever prop names that story expects.)

- [ ] **Step 8: Create 5 NEW stories**

`filter-list.stories.tsx`, `filter-list-item.stories.tsx`, `filter-list-section.stories.tsx`, `filter-live-form.stories.tsx`, `filter-live-search.stories.tsx`. The existing `filter-button.stories.tsx` covers FilterButton.

- [ ] **Step 9: Create 6 docs pages**

`FilterList.md`, `FilterListItem.md`, `FilterListSection.md`, `FilterLiveForm.md`, `FilterLiveSearch.md`, `FilterButton.md`.

For `FilterList.md` Usage section, show the canonical pattern:

````md
```tsx
import { Card } from "@/components/ui/card";
import {
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  DataTable,
} from "@/components/admin";

const FilterSidebar = () => (
  <Card className="p-4">
    <FilterLiveSearch />
    <FilterList label="Status">
      <FilterListItem label="Published" value={{ status: "published" }} />
      <FilterListItem label="Draft" value={{ status: "draft" }} />
    </FilterList>
  </Card>
);

export const PostList = () => (
  <List aside={<FilterSidebar />}>
    <DataTable>
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);
```
````

- [ ] **Step 10: Update registry.json**

Add 6 entries alphabetically.

- [ ] **Step 11: Verify + Commit**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs

git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port filter sidebar family from ra-ui-materialui

Adds FilterList, FilterListItem, FilterListSection, FilterLiveForm,
FilterLiveSearch, FilterButton.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2b: List variants

**Files to create (5):**

| File                                           | Component            | Upstream reference                         |
| ---------------------------------------------- | -------------------- | ------------------------------------------ |
| `src/components/admin/simple-list.tsx`         | `SimpleList`         | `…/list/SimpleList/SimpleList.tsx`         |
| `src/components/admin/simple-list-item.tsx`    | `SimpleListItem`     | `…/list/SimpleList/SimpleListItem.tsx`     |
| `src/components/admin/simple-list-loading.tsx` | `SimpleListLoading`  | `…/list/SimpleList/SimpleListLoading.tsx`  |
| `src/components/admin/infinite-list.tsx`       | `InfiniteList`       | `…/list/InfiniteList.tsx`                  |
| `src/components/admin/infinite-pagination.tsx` | `InfinitePagination` | `…/list/pagination/InfinitePagination.tsx` |

**Convention pattern:** `list.tsx`, `list-pagination.tsx`, `single-field-list.tsx`.

- [ ] **Step 1: Read references**

- Read `src/components/admin/list.tsx`, `list-pagination.tsx`, `single-field-list.tsx`
- Read upstream files

- [ ] **Step 2: Create SimpleList**

```tsx
import type { ReactNode } from "react";
import {
  useListContext,
  useResourceContext,
  useCreatePath,
  type RaRecord,
} from "ra-core";
import { Link } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { SimpleListLoading } from "@/components/admin/simple-list-loading";

type Slot<T> = ((record: T) => ReactNode) | undefined;

export type SimpleListProps<T extends RaRecord = RaRecord> = {
  primaryText?: Slot<T>;
  secondaryText?: Slot<T>;
  tertiaryText?: Slot<T>;
  leftAvatar?: Slot<T>;
  leftIcon?: Slot<T>;
  rightIcon?: Slot<T>;
  linkType?: "edit" | "show" | false;
  className?: string;
};

export const SimpleList = <T extends RaRecord = RaRecord>(
  props: SimpleListProps<T>,
) => {
  const { data, isPending } = useListContext<T>();
  const resource = useResourceContext();
  const createPath = useCreatePath();
  if (isPending) return <SimpleListLoading />;
  if (!data || data.length === 0) return null;
  return (
    <ul className={props.className}>
      {data.map((record) => {
        const inner = (
          <div className="flex items-center gap-3 p-3 hover:bg-accent">
            {props.leftAvatar && <Avatar>{props.leftAvatar(record)}</Avatar>}
            {props.leftIcon && props.leftIcon(record)}
            <div className="flex-1 min-w-0">
              {props.primaryText && (
                <div className="font-medium truncate">
                  {props.primaryText(record)}
                </div>
              )}
              {props.secondaryText && (
                <div className="text-sm text-muted-foreground truncate">
                  {props.secondaryText(record)}
                </div>
              )}
              {props.tertiaryText && (
                <div className="text-xs text-muted-foreground/70">
                  {props.tertiaryText(record)}
                </div>
              )}
            </div>
            {props.rightIcon && props.rightIcon(record)}
          </div>
        );
        return (
          <li key={record.id}>
            {props.linkType === false || !resource ? (
              inner
            ) : (
              <Link
                to={createPath({
                  resource,
                  type: props.linkType ?? "edit",
                  id: record.id,
                })}
              >
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
};
```

- [ ] **Step 3: Create SimpleListItem**

Standalone item (used internally by SimpleList; exported for manual composition).

- [ ] **Step 4: Create SimpleListLoading**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export type SimpleListLoadingProps = { nbItems?: number };

export const SimpleListLoading = ({ nbItems = 5 }: SimpleListLoadingProps) => (
  <ul>
    {Array.from({ length: nbItems }).map((_, i) => (
      <li key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </li>
    ))}
  </ul>
);
```

- [ ] **Step 5: Create InfiniteList**

Drop-in replacement for `<List>` that uses `useInfiniteListController` from ra-core. Renders `<InfinitePagination>` at the bottom.

Reference `src/components/admin/list.tsx`; copy it, swap `useListController` → `useInfiniteListController`, replace `<ListPagination>` with `<InfinitePagination>`.

- [ ] **Step 6: Create InfinitePagination**

```tsx
import { useEffect, useRef } from "react";
import { useInfinitePaginationContext, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";

export const InfinitePagination = () => {
  const { hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePaginationContext();
  const translate = useTranslate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;
  return (
    <div ref={sentinelRef} className="py-4 text-center">
      <Button
        variant="outline"
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage
          ? translate("ra.action.loading", { _: "Loading..." })
          : translate("ra.navigation.next", { _: "Load more" })}
      </Button>
    </div>
  );
};
```

- [ ] **Step 7: Create 5 stories**

- [ ] **Step 8: Create 5 docs pages**

- [ ] **Step 9: Update registry.json**

Add 5 entries.

- [ ] **Step 10: Verify + Commit**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run --browser.headless
node ./scripts/build_registry.mjs

git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "feat: port SimpleList and InfiniteList from ra-ui-materialui

Adds SimpleList, SimpleListItem, SimpleListLoading, InfiniteList,
InfinitePagination.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Wave 3 — layout split (1 subagent, serial)

This wave touches `layout.tsx` and `app-sidebar.tsx`. Must run after Wave 1 is complete.

### Task 3: Extract layout subcomponents

**Files to create (8):**

| File                                           | Component           | Upstream reference               |
| ---------------------------------------------- | ------------------- | -------------------------------- |
| `src/components/admin/app-bar.tsx`             | `AppBar`            | `…/layout/AppBar.tsx`            |
| `src/components/admin/title.tsx`               | `Title`             | `…/layout/Title.tsx`             |
| `src/components/admin/title-portal.tsx`        | `TitlePortal`       | `…/layout/TitlePortal.tsx`       |
| `src/components/admin/menu.tsx`                | `Menu`              | `…/layout/Menu.tsx`              |
| `src/components/admin/resource-menu-item.tsx`  | `ResourceMenuItem`  | `…/layout/ResourceMenuItem.tsx`  |
| `src/components/admin/menu-item-link.tsx`      | `MenuItemLink`      | `…/layout/MenuItemLink.tsx`      |
| `src/components/admin/dashboard-menu-item.tsx` | `DashboardMenuItem` | `…/layout/DashboardMenuItem.tsx` |
| `src/components/admin/top-toolbar.tsx`         | `TopToolbar`        | `…/layout/TopToolbar.tsx`        |

**Files to modify:**

- `src/components/admin/layout.tsx`
- `src/components/admin/app-sidebar.tsx`

- [ ] **Step 1: Read references**

- Read `src/components/admin/layout.tsx`, `app-sidebar.tsx`, `breadcrumb.tsx`, `user-menu.tsx`
- Read upstream files

- [ ] **Step 2: Create TitlePortal (first — others reference it)**

```tsx
export const TITLE_PORTAL_ID = "ra-title-portal";

export const TitlePortal = ({ className }: { className?: string }) => (
  <div id={TITLE_PORTAL_ID} className={className} />
);
```

- [ ] **Step 3: Create Title**

```tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TITLE_PORTAL_ID } from "@/components/admin/title-portal";

export type TitleProps = {
  title?: string | React.ReactElement;
  defaultTitle?: string;
};

export const Title = ({ title, defaultTitle }: TitleProps) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById(TITLE_PORTAL_ID));
  }, []);
  const text = title ?? defaultTitle ?? "";
  if (!target) return null;
  return createPortal(
    <h1 className="text-lg font-semibold truncate">{text}</h1>,
    target,
  );
};
```

- [ ] **Step 4: Create AppBar**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SidebarToggleButton } from "@/components/admin/sidebar-toggle-button";
import { TitlePortal } from "@/components/admin/title-portal";
import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { RefreshButton } from "@/components/admin/refresh-button";
import { UserMenu } from "@/components/admin/user-menu";

export type AppBarProps = {
  children?: ReactNode;
  className?: string;
};

export const AppBar = ({ children, className }: AppBarProps) => (
  <header
    className={cn(
      "flex h-16 md:h-12 shrink-0 items-center gap-2 px-4",
      className,
    )}
  >
    {children ?? (
      <>
        <SidebarToggleButton />
        <div className="flex-1 flex items-center" id="breadcrumb">
          <TitlePortal />
        </div>
        <LocalesMenuButton />
        <ThemeModeToggle />
        <RefreshButton />
        <UserMenu />
      </>
    )}
  </header>
);
```

- [ ] **Step 5: Create Menu**

```tsx
import type { ReactNode } from "react";
import { useResourceDefinitions } from "ra-core";
import { ResourceMenuItem } from "@/components/admin/resource-menu-item";
import { cn } from "@/lib/utils";

export type MenuProps = {
  children?: ReactNode;
  className?: string;
};

export const Menu = ({ children, className }: MenuProps) => {
  const resources = useResourceDefinitions();
  return (
    <nav className={cn("flex flex-col gap-1 p-2", className)}>
      {children ??
        Object.keys(resources)
          .filter((name) => resources[name].hasList)
          .map((name) => <ResourceMenuItem key={name} name={name} />)}
    </nav>
  );
};
```

- [ ] **Step 6: Create ResourceMenuItem**

```tsx
import { NavLink } from "react-router";
import {
  useResourceDefinition,
  useGetResourceLabel,
  useCreatePath,
} from "ra-core";
import { cn } from "@/lib/utils";
import { createElement } from "react";

export type ResourceMenuItemProps = {
  name: string;
  className?: string;
};

export const ResourceMenuItem = ({
  name,
  className,
}: ResourceMenuItemProps) => {
  const definition = useResourceDefinition({ resource: name });
  const getResourceLabel = useGetResourceLabel();
  const createPath = useCreatePath();
  if (!definition?.hasList) return null;
  const to = createPath({ resource: name, type: "list" });
  const label = getResourceLabel(name, 2);
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2 rounded hover:bg-accent text-sm",
          isActive && "bg-accent font-medium",
          className,
        )
      }
    >
      {definition.icon && createElement(definition.icon)}
      <span>{label}</span>
    </NavLink>
  );
};
```

- [ ] **Step 7: Create MenuItemLink**

```tsx
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

export type MenuItemLinkProps = {
  to: string;
  primaryText: ReactNode;
  leftIcon?: ReactNode;
  className?: string;
};

export const MenuItemLink = ({
  to,
  primaryText,
  leftIcon,
  className,
}: MenuItemLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 px-3 py-2 rounded hover:bg-accent text-sm",
        isActive && "bg-accent font-medium",
        className,
      )
    }
  >
    {leftIcon}
    <span>{primaryText}</span>
  </NavLink>
);
```

- [ ] **Step 8: Create DashboardMenuItem**

```tsx
import { Home } from "lucide-react";
import { useTranslate } from "ra-core";
import { MenuItemLink } from "@/components/admin/menu-item-link";

export type DashboardMenuItemProps = { className?: string };

export const DashboardMenuItem = ({ className }: DashboardMenuItemProps) => {
  const translate = useTranslate();
  return (
    <MenuItemLink
      to="/"
      primaryText={translate("ra.page.dashboard", { _: "Dashboard" })}
      leftIcon={<Home className="size-4" />}
      className={className}
    />
  );
};
```

- [ ] **Step 9: Create TopToolbar**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TopToolbarProps = {
  children: ReactNode;
  className?: string;
};

export const TopToolbar = ({ children, className }: TopToolbarProps) => (
  <div className={cn("flex items-center justify-end gap-2 mb-2", className)}>
    {children}
  </div>
);
```

- [ ] **Step 10: Refactor `layout.tsx`**

Replace the existing implementation with:

```tsx
import type { ErrorInfo } from "react";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import type { CoreLayoutProps } from "ra-core";
import { ErrorBoundary } from "react-error-boundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Notification } from "@/components/admin/notification";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AppBar } from "@/components/admin/app-bar";
import { Error } from "@/components/admin/error";
import { Loading } from "@/components/admin/loading";

export const Layout = (props: CoreLayoutProps) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const handleError = (_: unknown, info: ErrorInfo) => setErrorInfo(info);
  return (
    <SidebarProvider>
      <AppSidebar />
      <main
        className={cn(
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "sm:transition-[width] sm:duration-200 sm:ease-linear",
          "flex h-svh flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh",
        )}
      >
        <AppBar />
        <ErrorBoundary
          onError={handleError}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Error
              error={error}
              errorInfo={errorInfo}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={<Loading />}>
            <div className="flex flex-1 flex-col px-4">{props.children}</div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Notification />
    </SidebarProvider>
  );
};
```

- [ ] **Step 11: Refactor `app-sidebar.tsx`**

Identify the section that iterates resources and renders sidebar items, replace with `<Menu />`. Keep any header/footer/branding markup.

- [ ] **Step 12: Run the dev server and visually verify the demo**

```bash
pnpm dev
```

Open http://localhost:5173. Click through each demo resource (products, orders, customers, categories, reviews). Verify:

- The header still renders with sidebar trigger, breadcrumb, locales/theme/refresh/user menu
- The sidebar still renders the resource list and clicking each navigates
- No console errors

- [ ] **Step 13: Create 8 new stories**

`app-bar.stories.tsx`, `title.stories.tsx`, `title-portal.stories.tsx`, `menu.stories.tsx`, `resource-menu-item.stories.tsx`, `menu-item-link.stories.tsx`, `dashboard-menu-item.stories.tsx`, `top-toolbar.stories.tsx`.

- [ ] **Step 14: Create 8 docs pages**

- [ ] **Step 15: Update registry.json**

Add 8 entries.

- [ ] **Step 16: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm test
node ./scripts/build_registry.mjs
```

All existing tests must still pass.

- [ ] **Step 17: Commit**

```bash
git add src/components/admin/ src/stories/ docs/src/content/docs/ registry.json
git commit -m "refactor: split layout into composable subcomponents

Extracts AppBar, Title, TitlePortal, Menu, ResourceMenuItem, MenuItemLink,
DashboardMenuItem, TopToolbar from layout.tsx and app-sidebar.tsx. Public
Layout import path unchanged; existing apps see no diff.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Wave 4 — demo integration + final review (1 subagent)

Runs after Waves 1-3 are complete.

### Task 4: Wire composition-heavy components into the demo and verify end-to-end

- [ ] **Step 1: Wire FilterList into the demo customers resource**

Open `src/demo/customers/CustomerList.tsx` (or equivalent). Add `<FilterSidebar>` to the `aside` prop:

```tsx
import { Card } from "@/components/ui/card";
import { FilterList, FilterListItem, FilterLiveSearch } from "@/components/admin";

const CustomerFilterSidebar = () => (
  <Card className="p-4 space-y-2 w-64">
    <FilterLiveSearch />
    <FilterList label="Has ordered">
      <FilterListItem label="Yes" value={{ has_ordered: true }} />
      <FilterListItem label="No" value={{ has_ordered: false }} />
    </FilterList>
  </Card>
);

// In CustomerList:
<List aside={<CustomerFilterSidebar />}>...
```

- [ ] **Step 2: Wire SimpleList into the demo reviews resource for mobile**

Open `src/demo/reviews/ReviewList.tsx`. Either replace `<DataTable>` with `<SimpleList>` on small screens (CSS breakpoint), or add a story that demonstrates SimpleList against reviews.

- [ ] **Step 3: Wire FilterLiveSearch into the demo products resource**

Open `src/demo/products/ProductList.tsx`. Add `<FilterLiveSearch />` to the list filters.

- [ ] **Step 4: Verify the layout split still renders the demo identically**

Run `pnpm dev`. Click through each demo resource. Check that:

- Header shows: sidebar trigger, breadcrumb, locales menu, theme toggle, refresh, user menu
- Sidebar shows all 5 demo resources with icons
- Clicking a resource navigates to its list
- List/edit/create/show flows work

- [ ] **Step 5: Wire Empty + ListActions**

For at least one demo resource (e.g., orders), confirm filtering to an empty result renders `<ListNoResults>` and unfiltered empty state renders `<Empty>`.

- [ ] **Step 6: Run the full test suite**

```bash
pnpm typecheck
pnpm lint
pnpm test
node ./scripts/build_registry.mjs
```

All must pass.

- [ ] **Step 7: Append migration notes**

Create or update `docs/src/content/docs/Guides-And-Concepts/MigratingFromMUI.md` with sections covering:

1. **`mutationMode` prop vs separate `*WithConfirm*`/`*WithUndo*` exports.** Both supported.
2. **Theme** — Phase 1 ships a single shadcn-themed default; named themes (`bwTheme`, `nanoTheme`, `radiantTheme`, `houseTheme`) ship in Phase 2.
3. **TranslatableFields/Inputs** — deferred to Phase 2.
4. **Inspector / Configurable** — deferred to Phase 2.
5. **Any prop renames or omissions discovered during implementation.**

- [ ] **Step 8: Final registry build**

```bash
node ./scripts/build_registry.mjs
ls public/r/ | wc -l
```

Verify count makes sense.

- [ ] **Step 9: Final commit**

```bash
git add src/demo/ docs/src/content/docs/
git commit -m "feat: wire new parity components into demo + add migration notes

Demonstrates FilterList/FilterLiveSearch in customers, SimpleList in reviews
(mobile), and Empty/ListNoResults flow. Documents API differences from
ra-ui-materialui and lists Phase 2 items still pending.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 10: Final sanity check**

```bash
git log --oneline -20
git status
```

Should show all wave commits and a clean working tree.

---

## Self-review checklist (for the dispatcher, not subagents)

After each wave completes, the dispatcher (Claude in the main session) does:

1. **Spec coverage:** Compare landed components against the spec's Phase 1 table (section 4). Cross off each. Anything missing? Add a follow-up task.
2. **Placeholder scan:** `grep -rn "TODO\|FIXME\|XXX" src/components/admin/` for new files. Resolve.
3. **Type/lint/test:** Re-run `pnpm typecheck && pnpm lint && pnpm test`. Investigate any failure.
4. **Registry sanity:** `node ./scripts/build_registry.mjs && ls public/r/admin.json` — valid JSON with new entries.
5. **Demo smoke:** `pnpm dev`, click through each resource.

---

## Phase 2 trigger

After Phase 1 lands (all commits, tests green, demo smoke clean), pause and open a new session for Phase 2. Spec section 5 enumerates deferred scope. Same conventions + wave-based execution apply.
