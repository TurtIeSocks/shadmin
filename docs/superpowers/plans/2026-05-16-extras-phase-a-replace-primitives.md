# Extras Phase A — Replace Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 5 raw form primitives across existing demo resources with their corresponding extras components.

**Architecture:** Each task touches one demo resource. Where seed data must change, edit `src/demo/types.ts` + `src/demo/dataProvider.ts` together. Tests are integration-level: each task runs the affected resource's existing spec (if any) and adds one assertion verifying the new component is rendered.

**Tech Stack:** ra-core, shadcn/ui, fakerest dataProvider, faker.js for seed data.

**Related spec:** [extras-phase-a-replace-primitives](../specs/2026-05-16-extras-phase-a-replace-primitives-design.md)

---

## Task A1: CurrencyInput / CurrencyField in products + orders

**Files:**
- Modify: `src/demo/products/ProductEdit.tsx`
- Modify: `src/demo/products/ProductList.tsx` (only if NumberField price present)
- Modify: `src/demo/orders/OrderShow.tsx` (only if NumberField total present)
- Modify: `src/demo/orders/OrderList.tsx` (only if NumberField total present)

- [ ] **Step 1: Locate existing price/total uses**

```bash
grep -n "source=\"price\"\|source=\"total\"" src/demo/products/ src/demo/orders/ -r
```

Note each occurrence.

- [ ] **Step 2: Replace `<NumberInput source="price">` with `<CurrencyInput>` in ProductEdit**

```tsx
import { CurrencyInput } from "@/components/extras/currency-input";
// or via @/components/extras/index

<CurrencyInput source="price" currency="USD" />
```

Replace `<NumberInput source="price" .../>` accordingly.

- [ ] **Step 3: Replace `<NumberField source="price">` with `<CurrencyField>` in ProductList (if present)**

```tsx
import { CurrencyField } from "@/components/extras/currency-field";

<CurrencyField source="price" currency="USD" />
```

- [ ] **Step 4: Same for orders total in OrderShow + OrderList**

Same pattern for `<NumberField source="total">` → `<CurrencyField source="total" currency="USD" />`.

- [ ] **Step 5: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 6: Manual browser verification**

```bash
make run
```

Navigate to /products → edit a row → confirm price input shows `$` prefix.
Navigate to /products list → confirm price column shows `$XX.YY` format.
Navigate to /orders → same checks for total.

- [ ] **Step 7: Commit**

```bash
git add src/demo/products/ src/demo/orders/
git commit -m "$(cat <<'EOF'
feat(demo): use CurrencyInput/Field for product prices and order totals

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task A2: PhoneInput / PhoneField in customers

**Files:**
- Modify: `src/demo/types.ts`
- Modify: `src/demo/dataProvider.ts`
- Modify: `src/demo/customers/CustomerEdit.tsx`
- Modify: `src/demo/customers/CustomerShow.tsx` (if exists)
- Modify: `src/demo/customers/CustomerList.tsx` (optional column)

- [ ] **Step 1: Add `phone` to Customer type**

In `src/demo/types.ts`, locate the `Customer` interface, add:

```ts
phone?: string;
```

- [ ] **Step 2: Seed phone numbers**

In `src/demo/dataProvider.ts`, locate where customers seed data is generated. Add `phone` field to each generated customer, e.g.:

```ts
phone: faker.phone.number({ style: "international" }),
```

If `faker` not imported, add: `import { faker } from "@faker-js/faker";`. If customers seed is in a separate file (e.g., `users.json`), generate phone numbers via a `.map` in dataProvider.ts at load time:

```ts
import { faker } from "@faker-js/faker";
import users from "./users.json";
const customers = users.map((u) => ({ ...u, phone: faker.phone.number({ style: "international" }) }));
```

- [ ] **Step 3: Add PhoneInput to CustomerEdit**

In `src/demo/customers/CustomerEdit.tsx`, import + add input:

```tsx
import { PhoneInput } from "@/components/extras/phone-input";

<PhoneInput source="phone" defaultCountry="US" />
```

Place after the email field.

- [ ] **Step 4: Add PhoneField to CustomerShow + optional list column**

```tsx
import { PhoneField } from "@/components/extras/phone-field";

<PhoneField source="phone" />
```

- [ ] **Step 5: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 6: Manual browser verification**

```bash
make run
```

/customers → open a customer → confirm phone field shows; edit → phone input with country selector.

- [ ] **Step 7: Commit**

```bash
git add src/demo/types.ts src/demo/dataProvider.ts src/demo/customers/
git commit -m "$(cat <<'EOF'
feat(demo): add phone field to customers using PhoneInput/Field

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task A3: ColorInput / ColorField in categories

**Files:**
- Modify: `src/demo/types.ts`
- Modify: `src/demo/dataProvider.ts`
- Modify: `src/demo/categories/CategoryEdit.tsx`
- Modify: `src/demo/categories/CategoryList.tsx`

- [ ] **Step 1: Add `color` to Category type**

```ts
color: string;
```

- [ ] **Step 2: Seed categories with palette colors**

```ts
const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
const categories = baseCategories.map((c, i) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
```

- [ ] **Step 3: Add ColorInput to CategoryEdit**

```tsx
import { ColorInput } from "@/components/extras/color-input";

<ColorInput source="color" format="hex" />
```

After the `name` field.

- [ ] **Step 4: Add ColorField swatch to CategoryList**

```tsx
import { ColorField } from "@/components/extras/color-field";

<ColorField source="color" />
```

Place as the first column.

- [ ] **Step 5: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 6: Manual browser verification**

```bash
make run
```

/categories list → confirm color swatches. Edit one → color picker opens.

- [ ] **Step 7: Commit**

```bash
git add src/demo/types.ts src/demo/dataProvider.ts src/demo/categories/
git commit -m "$(cat <<'EOF'
feat(demo): add color field to categories using ColorInput/Field

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task A4: RatingInput / RatingField in reviews

**Files:**
- Modify: `src/demo/reviews/ReviewEdit.tsx`
- Modify: `src/demo/reviews/ReviewList.tsx`
- Modify: `src/demo/reviews/ReviewShow.tsx` (if exists)
- Modify: `src/demo/products/ProductEdit.tsx` (uses `StarRatingField` from reviews — keep working or migrate)
- Possibly delete: `src/demo/reviews/StarRatingField.tsx` (only if every consumer migrates)

- [ ] **Step 1: List StarRatingField consumers**

```bash
grep -rn "StarRatingField" src/demo/
```

Currently: `products/ProductEdit.tsx:24,214`, `dashboard/PendingReviews.tsx` (commented), `reviews/ReviewList.tsx:27`, `reviews/StarRatingField.tsx` (definition).

- [ ] **Step 2: Replace in ReviewEdit**

```tsx
import { RatingInput } from "@/components/extras/rating-input";

<RatingInput source="rating" max={5} allowHalf />
```

- [ ] **Step 3: Replace in ReviewList**

```tsx
import { RatingField } from "@/components/extras/rating-field";

<RatingField source="rating" max={5} />
```

Remove `import { StarRatingField } from "./StarRatingField";` if no other usage in this file.

- [ ] **Step 4: Replace in ProductEdit:214**

```tsx
import { RatingField } from "@/components/extras/rating-field";

<RatingField source="rating" max={5} />
```

Remove `import { StarRatingField, StarArray } from "../reviews/StarRatingField";` if `StarArray` also unused (grep first).

- [ ] **Step 5: Conditionally delete StarRatingField**

```bash
grep -rn "StarRatingField\|StarArray" src/demo/
```

If only definition remains: `rm src/demo/reviews/StarRatingField.tsx` and remove any stale import.

- [ ] **Step 6: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 7: Manual browser verification**

```bash
make run
```

/reviews list → confirm star ratings render. Edit a review → confirm interactive star input. /products → confirm review stars still render in product edit.

- [ ] **Step 8: Commit**

```bash
git add src/demo/reviews/ src/demo/products/
git commit -m "$(cat <<'EOF'
feat(demo): replace StarRatingField with extras RatingField/RatingInput

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task A5: StatusTransitionButton in orders

**Files:**
- Create: `src/demo/orders/order-transitions.ts`
- Modify: `src/demo/orders/OrderEdit.tsx`
- Modify: `src/demo/orders/OrderShow.tsx`

- [ ] **Step 1: Create transitions map**

`src/demo/orders/order-transitions.ts`:

```ts
export const ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  ordered: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: [],
};
```

- [ ] **Step 2: Replace AutocompleteInput status in OrderEdit**

```tsx
import { StatusTransitionButton } from "@/components/extras/status-transition-button";
import { ORDER_TRANSITIONS } from "./order-transitions";

<StatusTransitionButton source="status" transitions={ORDER_TRANSITIONS} />
```

Replace the existing `<AutocompleteInput source="status" choices=...>` block.

- [ ] **Step 3: Same in OrderShow if it has a status display+transition control**

If only displaying (no transition), keep `<SelectField>` or `<TextField source="status">`. Use `StatusTransitionButton` only where transition is allowed.

- [ ] **Step 4: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 5: Manual browser verification**

```bash
make run
```

/orders → edit an order with status="ordered" → confirm buttons only for "delivered" and "cancelled" (not back to "ordered"). Click "delivered" → status updates.

- [ ] **Step 6: Commit**

```bash
git add src/demo/orders/
git commit -m "$(cat <<'EOF'
feat(demo): use StatusTransitionButton for order status with guarded transitions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## End-of-plan checks

- [ ] Run full test suite:
  ```bash
  make test
  ```
- [ ] Smoke test all 5 affected resources in browser.
