# Extras Phase C — Layout Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire 7 remaining extras components into cross-cutting locations — order show sidebar, planning duration fields, list bulk actions, admin shell tools, header i18n switcher.

**Architecture:** No new resources. Edit existing layout / show / list files. Where a new seed resource is needed (order_comments), add to dataProvider without registering as a `<Resource>` (CommentsThread consumes via raw dataProvider).

**Tech Stack:** ra-core, shadcn/ui Sheet + Dialog, lucide-react.

**Related spec:** [extras-phase-c-layout-wiring](../specs/2026-05-16-extras-phase-c-layout-wiring-design.md)

---

## Task C1: CommentsThread in OrderShow sidebar

**Files:**

- Modify: `src/demo/types.ts`
- Create: `src/demo/orders/comments-seed.ts`
- Modify: `src/demo/dataProvider.ts`
- Modify: `src/demo/orders/OrderShow.tsx`

- [ ] **Step 1: Add OrderComment type**

```ts
export interface OrderComment {
  id: number;
  order_id: number;
  user_id: number;
  body: string;
  created_at: string;
  resolved: boolean;
}
```

- [ ] **Step 2: Seed**

```ts
// src/demo/orders/comments-seed.ts
import type { OrderComment } from "../types";

const SAMPLES = [
  "Customer requested faster shipping",
  "Verified payment with finance",
  "Address looks suspicious, double-check",
  "Discount applied per customer service ticket #4421",
  "Backorder for SKU-A12 expected next week",
];

export const orderCommentsSeed: OrderComment[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    order_id: (i % 15) + 1,
    user_id: (i % 5) + 1,
    body: SAMPLES[i % SAMPLES.length],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    resolved: i % 6 === 0,
  }),
);
```

- [ ] **Step 3: Wire seed into dataProvider**

```ts
import { orderCommentsSeed } from "./orders/comments-seed";
// in data:
order_comments: orderCommentsSeed,
```

(No `<Resource>` entry — consumed via raw `dataProvider.getList`.)

- [ ] **Step 4: Add comments sidebar to OrderShow**

In `src/demo/orders/OrderShow.tsx`, wrap existing show layout:

```tsx
import { CommentsThread } from "@/components/extras/comments-thread";

export const OrderShow = () => (
  <Show>
    <div className="flex gap-6">
      <div className="flex-1">
        <SimpleShowLayout>{/* existing fields */}</SimpleShowLayout>
      </div>
      <aside className="w-80 border-l pl-6">
        <CommentsThread
          reference="order_comments"
          target="order_id"
          allowMentions
          mentionResource="customers"
          resolvable
        />
      </aside>
    </div>
  </Show>
);
```

- [ ] **Step 5: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

/orders → open an order → confirm right-sidebar comments thread renders with seeded comments.

- [ ] **Step 6: Commit**

```bash
git add src/demo/types.ts src/demo/orders/ src/demo/dataProvider.ts
git commit -m "$(cat <<'EOF'
feat(demo): add CommentsThread sidebar to OrderShow

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C2: DurationInput/Field in planning tasks

**Files:**

- Modify: `src/demo/planning/tasks-seed.ts`
- Modify: `src/demo/planning/PlanningEdit.tsx`
- Modify: `src/demo/planning/PlanningShow.tsx`
- Modify: `src/demo/planning/PlanningList.tsx`
- Modify: `src/demo/planning/PlanningCreate.tsx`

- [ ] **Step 1: Add `estimated_duration_minutes` to Task type**

In `tasks-seed.ts`, extend the `Task` type:

```ts
export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  dueDate: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  estimated_duration_minutes?: number;
};
```

In seed array entries, sprinkle durations: `estimated_duration_minutes: 30 + (i * 17) % 480` per task.

- [ ] **Step 2: Add DurationInput to PlanningEdit + PlanningCreate**

```tsx
import { DurationInput } from "@/components/extras/duration-input";

<DurationInput source="estimated_duration_minutes" units={["m", "h"]} />;
```

After the `dueDate` field.

- [ ] **Step 3: Add DurationField to PlanningShow + PlanningList**

```tsx
import { DurationField } from "@/components/extras/duration-field";

<DurationField source="estimated_duration_minutes" />;
```

- [ ] **Step 4: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

/planning → confirm duration column/field renders humanized (e.g., "2h 30m").

- [ ] **Step 5: Commit**

```bash
git add src/demo/planning/
git commit -m "$(cat <<'EOF'
feat(demo): add estimated duration to planning tasks via DurationInput/Field

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C3: BulkEditDrawer in ProductList + OrderList

**Files:**

- Modify: `src/demo/products/ProductList.tsx`
- Modify: `src/demo/orders/OrderList.tsx`

- [ ] **Step 1: Wire BulkEditDrawer into ProductList bulk actions**

In `ProductList.tsx`, locate the existing bulk-action area (likely a `<BulkActionsToolbar>` with `<BulkDeleteButton>`). Add:

```tsx
import { BulkEditDrawer } from "@/components/extras/bulk-edit-drawer";

<BulkEditDrawer fields={["price", "stock", "category_id"]} side="right" />;
```

Place alongside the existing bulk-delete button.

- [ ] **Step 2: Same for OrderList**

```tsx
<BulkEditDrawer fields={["status"]} side="right" />
```

- [ ] **Step 3: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

/products → select multiple rows → toolbar shows "Bulk edit" button → opens drawer.
/orders → same flow.

- [ ] **Step 4: Commit**

```bash
git add src/demo/products/ src/demo/orders/
git commit -m "$(cat <<'EOF'
feat(demo): add BulkEditDrawer to product + order lists

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C4: DataProviderDevtools wired into admin shell

**Files:**

- Modify: `src/demo/App.tsx` (wrap dataProvider with devtools proxy)
- Modify: `src/demo/InspectorLayout.tsx` (or App.tsx if InspectorLayout isn't universal) — render the `<DataProviderDevtools>` panel

- [ ] **Step 1: Locate where dataProvider is constructed in App.tsx**

```bash
grep -n "dataProvider" src/demo/App.tsx
```

- [ ] **Step 2: Wrap with DataProviderDevtools proxy + render panel**

If `DataProviderDevtools` exports a higher-order wrapper:

```tsx
import { DataProviderDevtools, wrapDataProvider } from "@/components/extras/data-provider-devtools";

const wrappedDataProvider = wrapDataProvider(dataProvider);

<Admin dataProvider={wrappedDataProvider} ...>
  {/* resources */}
  <DataProviderDevtools position="bottom-right" keyboardShortcut="ctrl+shift+d" />
</Admin>
```

If only a standalone panel exists (no wrapper), render the panel and rely on the panel's internal hook to introspect.

- [ ] **Step 3: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

Press `Ctrl+Shift+D` → panel opens showing recent dataProvider calls.

- [ ] **Step 4: Commit**

```bash
git add src/demo/App.tsx src/demo/InspectorLayout.tsx
git commit -m "$(cat <<'EOF'
feat(demo): wire DataProviderDevtools into admin shell

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C5: ThemeStudio in admin shell

**Files:**

- Modify: `src/demo/InspectorLayout.tsx` (or whatever wraps the admin header)
- Possibly create: `src/demo/admin-tools-drawer.tsx`

- [ ] **Step 1: Inspect existing layout for header slot**

```bash
grep -n "AppBar\|header\|Header" src/demo/InspectorLayout.tsx src/components/admin/app-bar.tsx | head -20
```

- [ ] **Step 2: Add Theme button + Sheet in header or layout**

Create `src/demo/admin-tools-drawer.tsx`:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeStudio } from "@/components/extras/theme-studio";
import { PaletteIcon } from "lucide-react";

export const ThemeStudioButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme studio">
          <PaletteIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px]">
        <SheetTitle>Theme Studio</SheetTitle>
        <ThemeStudio
          onExport={(tokens) =>
            localStorage.setItem("demo:theme-tokens", JSON.stringify(tokens))
          }
        />
      </SheetContent>
    </Sheet>
  );
};
```

Wire into `InspectorLayout.tsx` header area:

```tsx
import { ThemeStudioButton } from "./admin-tools-drawer";
// inside header JSX:
<ThemeStudioButton />;
```

- [ ] **Step 3: Typecheck + lint + browser smoke**

- [ ] **Step 4: Commit**

```bash
git add src/demo/admin-tools-drawer.tsx src/demo/InspectorLayout.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add ThemeStudio drawer to admin header

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C6: LayoutBuilder in admin shell

**Files:**

- Modify: `src/demo/admin-tools-drawer.tsx` (extend with second button)
- Modify: `src/demo/InspectorLayout.tsx`

- [ ] **Step 1: Add LayoutBuilderButton to admin-tools-drawer.tsx**

```tsx
import { LayoutBuilder } from "@/components/extras/layout-builder";
import { LayoutIcon } from "lucide-react";

export const LayoutBuilderButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Layout builder">
          <LayoutIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px]">
        <SheetTitle>Layout Builder</SheetTitle>
        <LayoutBuilder
          onExport={(layout) =>
            localStorage.setItem("demo:layout", JSON.stringify(layout))
          }
        />
      </SheetContent>
    </Sheet>
  );
};
```

- [ ] **Step 2: Render in InspectorLayout header**

```tsx
<LayoutBuilderButton />
```

- [ ] **Step 3: Typecheck + lint + browser smoke**

- [ ] **Step 4: Commit**

```bash
git add src/demo/admin-tools-drawer.tsx src/demo/InspectorLayout.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add LayoutBuilder drawer to admin header

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C7: I18nKeyEditor in language selector

**Files:**

- Investigate: `src/components/admin/locales-menu-button.tsx` (or wherever language switcher lives in demo)
- Modify: that file (or create wrapper in `src/demo/`)

- [ ] **Step 1: Locate language switcher**

```bash
grep -rn "useLocaleState\|setLocale\|polyglotI18nProvider" src/demo/ src/components/admin/ | head -10
```

- [ ] **Step 2: Add "Translate UI" menu item that opens I18nKeyEditor in a Dialog**

If `locales-menu-button.tsx` is library code (`src/components/admin/`), DO NOT modify it. Instead, in `src/demo/`, create `i18n-tools-menu.tsx`:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { I18nKeyEditor } from "@/components/extras/i18n-key-editor";
import { LanguagesIcon } from "lucide-react";

export const I18nKeyEditorButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Translate UI">
          <LanguagesIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogTitle>UI Translation Editor</DialogTitle>
        <I18nKeyEditor />
      </DialogContent>
    </Dialog>
  );
};
```

Wire into `InspectorLayout.tsx` next to the existing language switcher:

```tsx
import { I18nKeyEditorButton } from "./i18n-tools-menu";
// inside header JSX:
<I18nKeyEditorButton />;
```

- [ ] **Step 3: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

Click language icon → dialog opens with I18nKeyEditor.

- [ ] **Step 4: Commit**

```bash
git add src/demo/i18n-tools-menu.tsx src/demo/InspectorLayout.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add I18nKeyEditor dialog button next to language switcher

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C8: JobMonitor dashboard widget

**Files:**

- Modify: `src/demo/dashboard/Dashboard.tsx`

- [ ] **Step 1: Add JobMonitor card to dashboard**

In `src/demo/dashboard/Dashboard.tsx`, import + render alongside existing dashboard cards:

```tsx
import { JobMonitor } from "@/components/extras/job-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Scheduled jobs</CardTitle>
  </CardHeader>
  <CardContent>
    <JobMonitor resource="scheduled_jobs" pollInterval={5000} />
  </CardContent>
</Card>;
```

Place in the dashboard grid alongside `OrderChart`, `NewCustomers`, etc.

- [ ] **Step 2: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

/dashboard → confirm JobMonitor card lists 6 seeded scheduled jobs with status badges.

- [ ] **Step 3: Commit**

```bash
git add src/demo/dashboard/Dashboard.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add JobMonitor dashboard widget reading from scheduled_jobs

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task C9: SchemaDrivenView as alt list view for products

**Files:**

- Create: `src/demo/products/product-schema.ts`
- Create: `src/demo/products/ProductSchemaList.tsx`
- Modify: `src/demo/App.tsx` (add custom route `/products/schema-view`)
- Modify: `src/demo/DemoSidebar.tsx` (add menu link)

- [ ] **Step 1: Define product schema**

```ts
// src/demo/products/product-schema.ts
export const PRODUCT_SCHEMA = {
  fields: [
    { source: "id", type: "number", label: "ID" },
    { source: "reference", type: "string", label: "Ref" },
    {
      source: "category_id",
      type: "reference",
      reference: "categories",
      label: "Category",
    },
    { source: "price", type: "currency", currency: "USD", label: "Price" },
    { source: "stock", type: "number", label: "Stock" },
    { source: "rating", type: "rating", max: 5, label: "Rating" },
  ],
};
```

(Adjust field shape to match what `SchemaDrivenView` expects — read `src/components/extras/schema-driven-view.tsx` for prop types.)

- [ ] **Step 2: ProductSchemaList.tsx**

```tsx
import { SchemaDrivenView } from "@/components/extras/schema-driven-view";
import { PRODUCT_SCHEMA } from "./product-schema";

export const ProductSchemaList = () => (
  <SchemaDrivenView schema={PRODUCT_SCHEMA} resource="products" mode="list" />
);
```

- [ ] **Step 3: Register custom route**

In `App.tsx`, add a `<CustomRoutes>` entry:

```tsx
import { CustomRoutes } from "ra-core";
import { Route } from "react-router-dom";
import { ProductSchemaList } from "./products/ProductSchemaList";

<CustomRoutes>
  <Route path="/products/schema-view" element={<ProductSchemaList />} />
</CustomRoutes>;
```

- [ ] **Step 4: Add sidebar link**

In `DemoSidebar.tsx`, under the "Catalog" group, add an item:

```tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link to="/products/schema-view">
      <DatabaseIcon className="size-4" />
      <span>Products (schema)</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

- [ ] **Step 5: Typecheck + lint + browser smoke**

Navigate to `/products/schema-view`. Verify the list renders from schema, mirroring data shown in normal `/products`.

- [ ] **Step 6: Commit**

```bash
git add src/demo/products/product-schema.ts src/demo/products/ProductSchemaList.tsx src/demo/App.tsx src/demo/DemoSidebar.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add SchemaDrivenView as alternate product list at /products/schema-view

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## End-of-plan checks

- [ ] `make test` passes.
- [ ] All 9 wirings verified in browser.
- [ ] No regressions to existing demos.
- [ ] All 21 extras components now reachable from a real demo flow (not just gallery).
