# Extras integration — Phase A: replace primitives in existing demo

**Date:** 2026-05-16
**Status:** Draft
**Phase:** A of C (extras integration)
**Related todos:** Integrate 21 recent extras components into real demo flows.

---

## Goal

Replace 5 raw form primitives in the existing demo resources (products, customers, categories, reviews, orders) with their corresponding extras components. Demonstrates real-world wiring rather than gallery-only display.

---

## Replacements

### 1. `CurrencyInput` / `CurrencyField` → products price + order total

**Files:**
- `src/demo/products/ProductEdit.tsx` (~line 92): `<NumberInput source="price" />` → `<CurrencyInput source="price" currency="USD" />`.
- `src/demo/products/ProductList.tsx`: if a `<NumberField source="price">` appears in the table, replace with `<CurrencyField source="price" currency="USD" />`.
- `src/demo/orders/OrderShow.tsx` / `OrderList.tsx`: if `<NumberField source="total">` appears, replace with `<CurrencyField source="total" currency="USD" />`.

**No data change.** Existing `price` and `total` fields are numbers in the fake data.

### 2. `PhoneInput` / `PhoneField` → customers

**Files:**
- `src/demo/types.ts`: add `phone?: string` to `Customer` interface.
- `src/demo/dataProvider.ts` (or wherever customer seed lives): generate phone numbers via fakerest's faker (`faker.phone.number()` or similar). Format E.164.
- `src/demo/customers/CustomerEdit.tsx`: add `<PhoneInput source="phone" defaultCountry="US" />` after the email field.
- `src/demo/customers/CustomerShow.tsx`: add `<PhoneField source="phone" />`.
- `src/demo/customers/CustomerList.tsx`: optionally show phone in a column.

### 3. `ColorInput` / `ColorField` → categories

**Files:**
- `src/demo/types.ts`: add `color: string` to `Category` interface (hex format `#RRGGBB`).
- `src/demo/dataProvider.ts` / category seed: assign each category a color (palette from `var(--chart-1)`..`var(--chart-5)` or random hex).
- `src/demo/categories/CategoryEdit.tsx`: add `<ColorInput source="color" format="hex" />` after `name`.
- `src/demo/categories/CategoryList.tsx`: prepend each row with `<ColorField source="color" />` swatch.
- Optionally use the color in product list badges (`<ChipField source="category" color={record.color} />`) — defer if scope creeps.

### 4. `RatingInput` / `RatingField` → reviews

**Files:**
- `src/demo/reviews/ReviewEdit.tsx` (~line 38): replace `StarRatingField` or `NumberInput rating` with `<RatingInput source="rating" max={5} allowHalf />`.
- `src/demo/reviews/ReviewList.tsx`: replace `StarRatingField` with `<RatingField source="rating" max={5} />`.
- `src/demo/reviews/ReviewShow.tsx`: same.
- Search the codebase for `StarRatingField` — if it exists as a custom component in `src/demo/reviews/`, mark it for deletion after migration.

### 5. `StatusTransitionButton` → orders status

**Files:**
- `src/demo/orders/OrderEdit.tsx` (~line 28): replace `<AutocompleteInput source="status" choices=[...]>` with `<StatusTransitionButton source="status" transitions={ORDER_TRANSITIONS} />`.
- New constant `ORDER_TRANSITIONS` in `src/demo/orders/order-transitions.ts`:
  ```ts
  export const ORDER_TRANSITIONS = {
    ordered: ["delivered", "cancelled"],
    delivered: ["cancelled"],
    cancelled: [],
  } as const;
  ```
- `src/demo/orders/OrderShow.tsx`: replace any `<SelectField source="status">` with `<StatusTransitionButton source="status" transitions={ORDER_TRANSITIONS} />` to allow show-view transitions.

---

## Files (summary)

- `src/demo/types.ts` — add `phone`, `color` fields
- `src/demo/dataProvider.ts` — extend seed data
- `src/demo/products/ProductEdit.tsx`
- `src/demo/products/ProductList.tsx` (if NumberField present)
- `src/demo/orders/OrderEdit.tsx`
- `src/demo/orders/OrderShow.tsx`
- `src/demo/orders/OrderList.tsx`
- `src/demo/orders/order-transitions.ts` (new)
- `src/demo/customers/CustomerEdit.tsx`
- `src/demo/customers/CustomerShow.tsx`
- `src/demo/customers/CustomerList.tsx` (optional column)
- `src/demo/categories/CategoryEdit.tsx`
- `src/demo/categories/CategoryList.tsx`
- `src/demo/reviews/ReviewEdit.tsx`
- `src/demo/reviews/ReviewList.tsx`
- `src/demo/reviews/ReviewShow.tsx`
- (delete) `src/demo/reviews/StarRatingField.tsx` if exists & unused after migration

---

## Acceptance criteria

- [ ] `make typecheck` passes after `types.ts` additions.
- [ ] Product edit form shows currency-formatted input ($).
- [ ] Customer edit form has phone input with country selector; saved phone renders via `PhoneField`.
- [ ] Category list shows color swatch per row; category edit has color picker.
- [ ] Review edit/show shows star rating widget (interactive on edit, read-only on show).
- [ ] Order edit's status field is a button row showing only valid next transitions (e.g., from `ordered` show `delivered` and `cancelled`).
- [ ] No regressions to existing demo specs.
- [ ] `make lint` clean.

---

## Assumptions

- Existing demo resources expose ra-core CRUD wrappers (`Edit`, `List`, `Show`) — no need to scaffold.
- Fakerest dataProvider regenerates seed data on app reload — adding fields to `types.ts` + seed is sufficient.
- `RatingField` / `RatingInput` API matches review's existing `rating` field shape (number 1-5).
- `StatusTransitionButton` expects a `transitions: Record<State, State[]>` shape (matches spec from `2026-05-16-twenty-one-component-ideas-design.md`).
- `PhoneInput` uses `libphonenumber-js` (already added as dep per phase-2-record-keepers spec).
- `ColorInput` `format="hex"` returns `#RRGGBB`; storing as string is fine for fake data.
- Existing `StarRatingField` (if present) becomes dead code after migration and is deleted.
- Optional category color in product list badges is deferred (not in scope).
