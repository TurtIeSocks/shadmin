---
title: "SubscriptionPlanPicker"
---

Card-grid input for selecting a subscription plan. One card per plan; clicking
writes the plan id to the form field. Highlights the current plan and
(optionally) a recommended one.

## Usage

```tsx
import { SubscriptionPlanPicker } from "@/components/admin";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: ["1 project", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    currency: "USD",
    interval: "month",
    features: ["Unlimited projects", "Email support", "10 GB storage"],
  },
];

<SubscriptionPlanPicker
  source="planId"
  plans={PLANS}
  recommendedPlanId="pro"
/>;
```

Wrap the picker in a `<SimpleForm>` (or any react-hook-form `<Form>` context).
The selected plan id is written to the form value at `source`.

## Props

| Prop                | Required | Type                          | Default  | Description                                   |
| ------------------- | -------- | ----------------------------- | -------- | --------------------------------------------- |
| `source`            | Required | `string`                      | -        | Form field receiving the plan id              |
| `plans`             | Required | `readonly SubscriptionPlan[]` | -        | Plan options                                  |
| `recommendedPlanId` | Optional | `string`                      | -        | Highlights one card with a "Recommended" tag  |
| `disabled`          | Optional | `boolean`                     | `false`  | Disable every card's select button            |
| `label`             | Optional | `string \| false`             | Inferred | Custom label; pass `false` to hide            |
| `helperText`        | Optional | `ReactNode`                   | -        | Helper text rendered under the picker         |
| `className`         | Optional | `string`                      | -        | CSS class applied to the wrapping `FormField` |

## Single-select behavior

The picker is a `<radiogroup>` semantically. Only one plan is selected at a
time; clicking another card replaces the selection. The currently selected
card is rendered with a primary border and a "Current" button label; the
recommended card (when set, and not currently selected) gets a softer accent.

## `recommendedPlanId`

```tsx
<SubscriptionPlanPicker source="planId" plans={PLANS} recommendedPlanId="pro" />
```

Only one card is flagged as "Recommended" at a time. When the recommended plan
is also the currently selected one, the "selected" styling wins.

## `SubscriptionPlan` shape

See [`<SubscriptionPlanField>`](./subscription-plan-field.md). The `features`
field is rendered as a bullet list inside each card.
