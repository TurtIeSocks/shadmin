# Extras integration — Phase C: layout wiring + new sections

**Date:** 2026-05-16
**Status:** Draft
**Phase:** C of C (extras integration)
**Related todos:** Integrate 21 recent extras components into real demo flows.

---

## Goal

Wire 7 remaining extras components into cross-cutting locations: the admin shell, the dashboard, existing resource show/edit views, and list bulk-action bars. These components are not resources themselves — they're widgets, drawers, or always-on tools.

---

## Wirings

### 1. `CommentsThread` → orders Show view

**File:** `src/demo/orders/OrderShow.tsx`
**Change:** Wrap existing show layout in a 2-column flex with a right sidebar containing:

```tsx
<aside className="w-80 border-l p-4">
  <CommentsThread
    reference="order_comments"
    target="order_id"
    allowMentions
    mentionResource="users"
  />
</aside>
```

**Data:** Add `order_comments` resource seed (no full CRUD UI — only consumed by CommentsThread).
Type: `{ id, order_id, user_id, body, created_at, resolved }`.
Seed: 1-3 comments per order (random subset).

### 2. `DurationInput` / `DurationField` → planning

**Investigate first:** `src/demo/planning/` — what resource does this folder ship? Likely tasks or events with `estimated_duration` fields. If no duration field exists in seed data, add `duration_minutes` to the relevant type.

**Files:** whichever Edit/Show/List view shows duration. Add:

- Edit: `<DurationInput source="estimated_duration_minutes" units={['m', 'h', 'd']} />`
- Show/List: `<DurationField source="estimated_duration_minutes" />`

**Fallback if planning has no time data:** add to orders as `estimated_delivery_duration` (e.g., "2d 6h" for delivery ETA).

### 3. `BulkEditDrawer` → ProductList + OrderList bulk action

**Files:**

- `src/demo/products/ProductList.tsx`: add a bulk action button "Bulk edit" that opens `<BulkEditDrawer fields={['price','stock','category_id']} side="right" />`.
- `src/demo/orders/OrderList.tsx`: bulk action button "Bulk edit status" → `<BulkEditDrawer fields={['status']} side="right" />`.

**Pattern:** mirror existing `<BulkDeleteButton>` placement in the bulk toolbar.

### 4. `DataProviderDevtools` → admin inspector (always-on)

**File:** `src/demo/InspectorLayout.tsx`
**Change:** Add `<DataProviderDevtools position="bottom-right" keyboardShortcut="ctrl+shift+d" />` rendered inside the layout, outside the main content area. Component should self-hide unless invoked.

**Alternative:** add to `src/demo/App.tsx` at the same level as `<Admin>` if InspectorLayout isn't the universal layout.

### 5. `ThemeStudio` → admin shell settings drawer

**File:** `src/demo/InspectorLayout.tsx` (or admin app-bar)
**Change:** Add a "Theme" button in the admin header that opens `<ThemeStudio tokens={defaultTheme} onExport={handleExport} />` in a `<Sheet>` from shadcn.
**Persistence:** `onExport` writes tokens to `localStorage` so app reload picks them up.

### 6. `LayoutBuilder` → admin shell settings drawer

**File:** `src/demo/InspectorLayout.tsx`
**Change:** Add a "Layout" button next to "Theme" that opens `<LayoutBuilder>` in a Sheet. Same persistence pattern.

### 7. `I18nKeyEditor` → admin header i18n switcher modal

**File:** Wherever the language selector lives — probably `src/components/admin/locales-menu-button.tsx` or `src/demo/DemoSidebar.tsx`.
**Change:** Replace simple locale-switcher dropdown with a dropdown that includes a "Translate UI" option opening `<I18nKeyEditor>` in a `<Dialog>`.

---

## Sidebar / shell housekeeping (touch up from Phase B)

- "Component Gallery" sidebar entries for components now in real demos can stay (they were the discovery surface). No removals.
- New "Devtools" subsidebar item linking to a route that renders `<DataProviderDevtools open />` as a full-page view — alternative to keyboard-shortcut trigger.

---

## Files

- `src/demo/orders/OrderShow.tsx`
- `src/demo/types.ts` — add `OrderComment` interface
- `src/demo/dataProvider.ts` — seed `order_comments`
- `src/demo/planning/` — investigate, then modify the relevant Edit + Show + List files (or fall back to orders for duration)
- `src/demo/products/ProductList.tsx`
- `src/demo/orders/OrderList.tsx`
- `src/demo/InspectorLayout.tsx`
- `src/components/admin/locales-menu-button.tsx` (or demo equivalent)

---

## Acceptance criteria

- [ ] Order show view has a right-sidebar comments thread with seeded comments.
- [ ] Planning resource (or fallback) edit form has a duration input; show view renders humanized duration.
- [ ] Product list + order list expose a "Bulk edit" toolbar button that opens a drawer; submitting updates selected rows.
- [ ] `ctrl+shift+d` opens DataProviderDevtools panel; panel shows recent dataProvider calls.
- [ ] Admin header has "Theme" + "Layout" buttons; each opens a side drawer with the corresponding tool. Changes persist across reload.
- [ ] Language selector includes "Translate UI" option opening I18nKeyEditor modal.
- [ ] No regression to existing demo flows.
- [ ] `make typecheck` + `make lint` clean.

---

## Assumptions

- `InspectorLayout.tsx` is the layout used by the admin shell (or a layout that can host the new tools).
- ra-core `BulkActionsToolbar` accepts custom children — `BulkEditDrawer` slots in alongside `BulkDeleteButton`.
- DataProviderDevtools intercepts the `dataProvider` via a proxy — passing it as the `dataProvider` prop of `<Admin>` is sufficient.
- ThemeStudio + LayoutBuilder both accept token/state via props and emit changes through callbacks; persistence is the demo's responsibility (localStorage).
- I18nKeyEditor uses the ra-core `i18nProvider` from context; no extra wiring needed.
- Planning resource shape will be inspected during implementation; fallback to orders is acceptable if planning has no time fields.
- Component Gallery entries for these components stay (discovery surface).
- New seed `order_comments` works without its own Resource entry as long as it's available via `dataProvider.getList('order_comments', ...)` for CommentsThread to consume.
