# Tier 3 SaaS / Collab Domain Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five SaaS / collaboration domain primitives — `<SubscriptionPlanField>` / `<SubscriptionPlanPicker>`, `<ApiKeyField>` / `<ApiKeyInput>`, `<WebhookEndpointInput>` / `<WebhookEndpointField>`, `<CommentsThread>`, `<DualApprovalButton>` — that fill a gap admins currently hand-roll.

**Architecture:** All components live in `src/components/extras/` (per the established convention: non-mirror components ship in extras, not admin). Components use existing ra-core hooks (`useRecordContext`, `useInput`, `useUpdate`, `useGetList`, `useCreate`, `useGetIdentity`) and shadcn primitives (`Card`, `Button`, `Input`, `Textarea`, `RadioGroup`, `Badge`). No new runtime deps.

**Tech Stack:** React 19, TypeScript, ra-core, shadcn/ui, Tailwind v4, Vitest + Playwright browser provider.

**Spec:** [docs/superpowers/specs/2026-05-16-twenty-one-component-ideas-design.md](../specs/2026-05-16-twenty-one-component-ideas-design.md) — Tier 3 batch (ideas 1, 3, 4, 5, 13).

## Assumptions (delegated decisions surfaced for review)

Because Tier 3 components are heterogeneous (mix of field+input pairs, threaded UI, action buttons), the following calls were made without per-question Q&A:

### SubscriptionPlanField / SubscriptionPlanPicker

1. `<SubscriptionPlanPicker>` renders a card grid with one card per plan; users single-select via the wrapping `<RadioGroup>` semantics. Multi-tier upgrade flow (with proration math, etc.) is out of scope.
2. Plans are passed via a `plans` prop array (`{ id, name, price, currency, interval, features }`). No fetched-plans variant in v1.
3. `<SubscriptionPlanField>` renders a compact badge with current plan name + price; click-through to the picker is a follow-up.

### ApiKeyField / ApiKeyInput

4. `<ApiKeyField>` masks all but the last 4 characters by default (`maskedFormat="last4"`). Reveal-on-click toggles the masked/full state per session (not persisted).
5. Clipboard copy via the browser Clipboard API (`navigator.clipboard.writeText`). No fallback for non-secure-context.
6. `<ApiKeyInput>` is a single-purpose rotation control: a single `Rotate` button that fires `onRotate(record)`. No new-key generation flow in v1 (that's a server-driven mutation; the input only triggers the rotation).
7. `lastUsedSource` renders relative time via `Intl.RelativeTimeFormat`; "never" when null.

### WebhookEndpointInput / WebhookEndpointField

8. Storage shape = composite `{ url, secret, eventTypes, lastDelivery?: { status, at } }`. Top-level `source` reads this object from the record.
9. Event-type multi-select via shadcn `<Checkbox>` group (not popover combobox in v1). Compact for small event lists.
10. Test-ping button fires the supplied `onTestPing(url, secret)` async callback. No retry/backoff UI.
11. `<WebhookEndpointField>` renders URL + status badge ("OK" / "Failed" / "Pending"). Secret is never displayed in the field.

### CommentsThread

12. Reads `comments` sub-resource via `useGetList({ resource: commentResource, filter: { [parentSource]: parentId } })`. Caller is responsible for the dataProvider matching this convention.
13. Comment shape: `{ id, authorId, authorName?, body, createdAt, resolvedAt?, parentId }`. Flat list (no nested replies) in v1. Threading deferred.
14. `@mentions` rendered as plain text in v1 (no autocomplete during typing, no styled chips). Body is plain text via `<Textarea>`.
15. Edit/delete restricted to the comment author (matched by `useGetIdentity().id === comment.authorId`). No moderator override flow.
16. Optional `resolvable` prop adds a "Mark resolved" toggle per comment.

### DualApprovalButton

17. Approver tracking via record field `approverSource` (default `"approvers"`, a `string[]` of user ids).
18. Threshold via `required` prop (default 2). When `approvers.length >= required`, the record's status becomes `approved`.
19. Self-approval blocking: if the current user's id is already in `approvers`, the button is disabled with a tooltip "You already approved".
20. On approval, the button calls `useUpdate` with `{ approvers: [...record.approvers, currentUserId], status: count+1 >= required ? "approved" : "pending" }`. No separate audit record.
21. Rejection path is out of scope for v1 (use `<ApprovalQueue>` for reject + reason). DualApproval is for the positive flow only.

### General

22. All seven components live in `src/components/extras/` and are exported from `src/components/extras/index.ts`.
23. Sidebar group for all = `Extras` (consistent with the existing higher-order components like `<ApprovalQueue>`, `<BulkEditDrawer>`).
24. Story titles use the `Extras/<ComponentName>` prefix.
25. No new runtime deps.

---

## File structure

| File                                                      | Responsibility               | Status     |
| --------------------------------------------------------- | ---------------------------- | ---------- |
| `src/components/extras/subscription-plan-field.tsx`       | Plan badge field             | **Create** |
| `src/components/extras/subscription-plan-picker.tsx`      | Plan picker card grid        | **Create** |
| `src/components/extras/subscription-plan-field.spec.tsx`  | Browser tests                | **Create** |
| `src/components/extras/subscription-plan-picker.spec.tsx` | Browser tests                | **Create** |
| `src/stories/extras/subscription-plan-field.stories.tsx`  | Stories                      | **Create** |
| `src/stories/extras/subscription-plan-picker.stories.tsx` | Stories                      | **Create** |
| `docs/src/content/docs/subscription-plan-field.md`        | Doc page                     | **Create** |
| `docs/src/content/docs/subscription-plan-picker.md`       | Doc page                     | **Create** |
| `src/components/extras/api-key-field.tsx`                 | Masked API-key display       | **Create** |
| `src/components/extras/api-key-input.tsx`                 | API-key rotation control     | **Create** |
| `src/components/extras/api-key-field.spec.tsx`            | Browser tests                | **Create** |
| `src/components/extras/api-key-input.spec.tsx`            | Browser tests                | **Create** |
| `src/stories/extras/api-key-field.stories.tsx`            | Stories                      | **Create** |
| `src/stories/extras/api-key-input.stories.tsx`            | Stories                      | **Create** |
| `docs/src/content/docs/api-key-field.md`                  | Doc page                     | **Create** |
| `docs/src/content/docs/api-key-input.md`                  | Doc page                     | **Create** |
| `src/components/extras/webhook-endpoint-field.tsx`        | Webhook URL + status display | **Create** |
| `src/components/extras/webhook-endpoint-input.tsx`        | Webhook composite input      | **Create** |
| `src/components/extras/webhook-endpoint-field.spec.tsx`   | Browser tests                | **Create** |
| `src/components/extras/webhook-endpoint-input.spec.tsx`   | Browser tests                | **Create** |
| `src/stories/extras/webhook-endpoint-field.stories.tsx`   | Stories                      | **Create** |
| `src/stories/extras/webhook-endpoint-input.stories.tsx`   | Stories                      | **Create** |
| `docs/src/content/docs/webhook-endpoint-field.md`         | Doc page                     | **Create** |
| `docs/src/content/docs/webhook-endpoint-input.md`         | Doc page                     | **Create** |
| `src/components/extras/comments-thread.tsx`               | Threaded comments view       | **Create** |
| `src/components/extras/comments-thread.spec.tsx`          | Browser tests                | **Create** |
| `src/stories/extras/comments-thread.stories.tsx`          | Stories                      | **Create** |
| `docs/src/content/docs/comments-thread.md`                | Doc page                     | **Create** |
| `src/components/extras/dual-approval-button.tsx`          | 4-eyes approval button       | **Create** |
| `src/components/extras/dual-approval-button.spec.tsx`     | Browser tests                | **Create** |
| `src/stories/extras/dual-approval-button.stories.tsx`     | Stories                      | **Create** |
| `docs/src/content/docs/dual-approval-button.md`           | Doc page                     | **Create** |
| `src/components/extras/index.ts`                          | Re-export 9 new exports      | **Modify** |
| `docs/sidebar.config.mjs`                                 | Add 9 entries under Extras   | **Modify** |

---

## Shared conventions

All Tier 3 components follow Tier 1/2 conventions:

- Tests use the shared `StoryAdmin` helper from `@/stories/_test-helpers` and import story exports (except `<CommentsThread>` and `<DualApprovalButton>`, which need inline wrappers for the contexts they consume).
- Stories live at `src/stories/extras/<name>.stories.tsx`.
- Specs live at `src/components/extras/<name>.spec.tsx`.
- Doc pages at `docs/src/content/docs/<name>.md` with `title:` frontmatter matching the component export name.
- Sidebar group = `Extras`; story `title:` = `Extras/<ComponentName>`.
- Story files MUST have `export const Basic` and be ≥30 lines (check-stories.mjs rules).
- Commit per task; Conventional Commits; `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` footer.
- Lint = `pnpm run lint`. Typecheck = `pnpm run typecheck`. Single-file test = `pnpm vitest run --browser.headless src/components/extras/<file>.spec.tsx`. Run lint + typecheck in parallel.

## Component 1: SubscriptionPlan (Field + Picker)

Plan badge field + tier-switch card grid.

### Task 1.1: `<SubscriptionPlanField>` story

**Files:** Create `src/stories/extras/subscription-plan-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { SubscriptionPlanField } from "@/components/admin";

export default { title: "Extras/SubscriptionPlanField" };

const PLANS = [
  { id: "free", name: "Free", price: 0, currency: "USD", interval: "month" },
  { id: "pro", name: "Pro", price: 29, currency: "USD", interval: "month" },
  { id: "team", name: "Team", price: 99, currency: "USD", interval: "month" },
];

export const Basic = () => (
  <StoryAdmin record={{ planId: "pro" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const Free = () => (
  <StoryAdmin record={{ planId: "free" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const Unknown = () => (
  <StoryAdmin record={{ planId: "mystery" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} empty="—" />
  </StoryAdmin>
);
```

### Task 1.2: Implement `<SubscriptionPlanField>` + spec

**Files:** Create `src/components/extras/subscription-plan-field.tsx`, `src/components/extras/subscription-plan-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Free,
  Unknown,
} from "@/stories/extras/subscription-plan-field.stories";

describe("<SubscriptionPlanField />", () => {
  it("renders the matched plan's name and price", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Pro")).toBeInTheDocument();
    await expect.element(screen.getByText(/\$29/)).toBeInTheDocument();
  });

  it("renders the Free plan label when matched", async () => {
    const screen = render(<Free />);
    await expect.element(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders empty fallback when planId doesn't match any plan", async () => {
    const screen = render(<Unknown />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/subscription-plan-field.tsx
import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features?: readonly string[];
}

/**
 * Displays the user's current subscription plan as a compact badge showing
 * plan name + price. Looks up the plan from a `plans` array by id.
 *
 * @example
 * <SubscriptionPlanField source="planId" plans={PLANS} />
 */
export const SubscriptionPlanField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  empty,
  plans,
  className,
  ...rest
}: SubscriptionPlanFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();
  const plan = plans.find((p) => p.id === value);

  if (!plan) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.price);

  return (
    <Badge
      variant="secondary"
      className={className}
      {...sanitizeFieldRestProps(rest)}
    >
      <span className="font-medium">{plan.name}</span>
      <span className="ml-2 text-xs text-muted-foreground">
        {formatted}/{plan.interval}
      </span>
    </Badge>
  );
};

export interface SubscriptionPlanFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends
    FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Available plans to look up by id. */
  plans: readonly SubscriptionPlan[];
}
```

- [ ] **Step 4** — append export to `src/components/extras/index.ts` (alpha-insert).
- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/subscription-plan-field.stories.tsx src/components/extras/subscription-plan-field.tsx src/components/extras/subscription-plan-field.spec.tsx src/components/extras/index.ts
git commit -m "feat(subscription-plan-field): add SubscriptionPlanField component + story + spec"
```

### Task 1.3: `<SubscriptionPlanPicker>` story

**Files:** Create `src/stories/extras/subscription-plan-picker.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { SubscriptionPlanPicker } from "@/components/admin";

export default { title: "Extras/SubscriptionPlanPicker" };

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
  {
    id: "team",
    name: "Team",
    price: 99,
    currency: "USD",
    interval: "month",
    features: ["Everything in Pro", "SSO", "Priority support"],
  },
];

export const Basic = () => (
  <StoryAdmin mode="form" record={{ planId: "pro" }}>
    <SubscriptionPlanPicker source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const RecommendedTier = () => (
  <StoryAdmin mode="form" record={{ planId: "free" }}>
    <SubscriptionPlanPicker
      source="planId"
      plans={PLANS}
      recommendedPlanId="pro"
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ planId: "pro" }}>
    <SubscriptionPlanPicker source="planId" plans={PLANS} disabled />
  </StoryAdmin>
);
```

### Task 1.4: Implement `<SubscriptionPlanPicker>` + spec

**Files:** Create `src/components/extras/subscription-plan-picker.tsx`, `src/components/extras/subscription-plan-picker.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  RecommendedTier,
} from "@/stories/extras/subscription-plan-picker.stories";

describe("<SubscriptionPlanPicker />", () => {
  it("renders a card per plan", async () => {
    const screen = render(<Basic />);
    const cards = screen.container.querySelectorAll("[data-plan-card]");
    expect(cards.length).toBe(3);
  });

  it("marks the current plan card as selected", async () => {
    const screen = render(<Basic />);
    const proCard = screen.container.querySelector(
      "[data-plan-card='pro']",
    ) as HTMLElement;
    expect(proCard.getAttribute("data-selected")).toBe("true");
  });

  it("flags the recommended plan when set", async () => {
    const screen = render(<RecommendedTier />);
    const proCard = screen.container.querySelector(
      "[data-plan-card='pro']",
    ) as HTMLElement;
    expect(proCard.getAttribute("data-recommended")).toBe("true");
  });

  it("disables all cards when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const buttons = screen.container.querySelectorAll(
      "[data-plan-card] button",
    );
    Array.from(buttons).forEach((b) =>
      expect((b as HTMLButtonElement).disabled).toBe(true),
    );
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/subscription-plan-picker.tsx
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import type { SubscriptionPlan } from "./subscription-plan-field";
import { cn } from "@/lib/utils";

/**
 * Card-grid plan picker. One card per `plans` entry, clicking a card writes
 * its `id` to the form field. Highlights the current plan and (optionally)
 * a recommended plan.
 *
 * @example
 * <SubscriptionPlanPicker source="planId" plans={PLANS} recommendedPlanId="pro" />
 */
export const SubscriptionPlanPicker = (props: SubscriptionPlanPickerProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    plans,
    recommendedPlanId,
    disabled,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);
  const currentId = (field.value as string | null | undefined) ?? null;

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div
          role="radiogroup"
          className="grid gap-3 sm:grid-cols-3"
          aria-disabled={disabled}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={currentId === plan.id}
              recommended={recommendedPlanId === plan.id}
              disabled={disabled}
              onSelect={() => !disabled && field.onChange(plan.id)}
            />
          ))}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

interface PlanCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  recommended: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const PlanCard = ({
  plan,
  selected,
  recommended,
  disabled,
  onSelect,
}: PlanCardProps) => {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.price);

  return (
    <Card
      data-plan-card={plan.id}
      data-selected={selected ? "true" : "false"}
      data-recommended={recommended ? "true" : "false"}
      className={cn(
        "transition",
        selected && "border-primary ring-2 ring-primary",
        recommended && !selected && "border-primary/50",
      )}
      role="radio"
      aria-checked={selected}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          {recommended && (
            <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Recommended
            </span>
          )}
        </CardTitle>
        <div className="text-2xl font-semibold tabular-nums">
          {formatted}
          <span className="text-sm font-normal text-muted-foreground">
            /{plan.interval}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {plan.features && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          className="mt-4 w-full"
          variant={selected ? "default" : "outline"}
          onClick={onSelect}
          disabled={disabled}
        >
          {selected ? "Current" : "Select"}
        </Button>
      </CardContent>
    </Card>
  );
};

export interface SubscriptionPlanPickerProps extends InputProps {
  plans: readonly SubscriptionPlan[];
  recommendedPlanId?: string;
  disabled?: boolean;
}
```

- [ ] **Step 4** — append export to `index.ts`: `export * from "./subscription-plan-picker";`
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/subscription-plan-picker.stories.tsx src/components/extras/subscription-plan-picker.tsx src/components/extras/subscription-plan-picker.spec.tsx src/components/extras/index.ts
git commit -m "feat(subscription-plan-picker): add SubscriptionPlanPicker component + story + spec"
```

### Task 1.5: Doc pages

**Files:** Create `docs/src/content/docs/subscription-plan-field.md`, `docs/src/content/docs/subscription-plan-picker.md`

- [ ] **Step 1** — write `subscription-plan-field.md`:

````markdown
---
title: "SubscriptionPlanField"
---

Displays the user's current subscription plan as a compact badge.

## Usage

```tsx
import { SubscriptionPlanField } from "@/components/admin";

const PLANS = [
  { id: "free", name: "Free", price: 0, currency: "USD", interval: "month" },
  { id: "pro", name: "Pro", price: 29, currency: "USD", interval: "month" },
];

<SubscriptionPlanField source="planId" plans={PLANS} />;
```

## Props

| Prop        | Required | Type                          | Default | Description                     |
| ----------- | -------- | ----------------------------- | ------- | ------------------------------- |
| `source`    | Required | `string`                      | -       | Record field for the plan id    |
| `plans`     | Required | `readonly SubscriptionPlan[]` | -       | Available plans                 |
| `empty`     | Optional | `ReactNode`                   | -       | Fallback when planId is unknown |
| `className` | Optional | `string`                      | -       | CSS class                       |

## `SubscriptionPlan` shape

```ts
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features?: readonly string[];
}
```
````

- [ ] **Step 2** — write `subscription-plan-picker.md`:

````markdown
---
title: "SubscriptionPlanPicker"
---

Card-grid input for selecting a subscription plan. One card per plan; clicking
writes the plan id to the form field.

## Usage

```tsx
import { SubscriptionPlanPicker } from "@/components/admin";

<SubscriptionPlanPicker
  source="planId"
  plans={PLANS}
  recommendedPlanId="pro"
/>;
```

## Props

| Prop                | Required | Type                          | Default  | Description         |
| ------------------- | -------- | ----------------------------- | -------- | ------------------- |
| `source`            | Required | `string`                      | -        | Form field          |
| `plans`             | Required | `readonly SubscriptionPlan[]` | -        | Plan options        |
| `recommendedPlanId` | Optional | `string`                      | -        | Highlights one card |
| `disabled`          | Optional | `boolean`                     | `false`  | Disable all cards   |
| `label`             | Optional | `string \| false`             | Inferred | Custom label        |
| `helperText`        | Optional | `ReactNode`                   | -        | Helper text         |

## Single-select behavior

The picker is a `<radiogroup>` semantically. Only one plan is selected at a
time; clicking another card replaces the selection.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/subscription-plan-field.md docs/src/content/docs/subscription-plan-picker.md
git commit -m "docs(subscription-plan): add SubscriptionPlanField + SubscriptionPlanPicker documentation"
```

---

## Component 2: ApiKey (Field + Input)

Masked API-key display with reveal + copy. Input handles rotation.

### Task 2.1: `<ApiKeyField>` story

**Files:** Create `src/stories/extras/api-key-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { ApiKeyField } from "@/components/admin";

export default { title: "Extras/ApiKeyField" };

export const Basic = () => (
  <StoryAdmin record={{ apiKey: "sk_live_***" }}>
    <ApiKeyField source="apiKey" />
  </StoryAdmin>
);

export const WithScopes = () => (
  <StoryAdmin
    record={{
      apiKey: "sk_live_***",
      scopes: ["read", "write"],
    }}
  >
    <ApiKeyField source="apiKey" scopesSource="scopes" />
  </StoryAdmin>
);

export const WithLastUsed = () => (
  <StoryAdmin
    record={{
      apiKey: "sk_live_***",
      lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    }}
  >
    <ApiKeyField source="apiKey" lastUsedSource="lastUsedAt" />
  </StoryAdmin>
);

export const NeverUsed = () => (
  <StoryAdmin record={{ apiKey: "sk_test_xyz", lastUsedAt: null }}>
    <ApiKeyField source="apiKey" lastUsedSource="lastUsedAt" />
  </StoryAdmin>
);
```

### Task 2.2: Implement `<ApiKeyField>` + spec

**Files:** Create `src/components/extras/api-key-field.tsx`, `src/components/extras/api-key-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  NeverUsed,
  WithLastUsed,
  WithScopes,
} from "@/stories/extras/api-key-field.stories";

describe("<ApiKeyField />", () => {
  it("masks the key by default showing only the last 4 characters", async () => {
    const screen = render(<Basic />);
    const masked = screen.container.querySelector(
      "[data-api-key]",
    ) as HTMLElement;
    expect(masked.textContent ?? "").toMatch(/^[•*]+.{4}$/);
  });

  it("reveals the key on click of the reveal button", async () => {
    const screen = render(<Basic />);
    const reveal = screen.container.querySelector(
      "[data-api-key-reveal]",
    ) as HTMLButtonElement;
    reveal.click();
    await expect.element(screen.getByText("sk_live_***")).toBeInTheDocument();
  });

  it("renders scope badges when scopesSource is set", async () => {
    const screen = render(<WithScopes />);
    const badges = screen.container.querySelectorAll("[data-scope-badge]");
    expect(badges.length).toBe(2);
  });

  it("renders a relative 'last used' label when lastUsedSource is set and not null", async () => {
    const screen = render(<WithLastUsed />);
    await expect.element(screen.getByText(/hours? ago/i)).toBeInTheDocument();
  });

  it("renders 'Never' for last used when value is null", async () => {
    const screen = render(<NeverUsed />);
    await expect.element(screen.getByText(/never/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/api-key-field.tsx
import { useState, type HTMLAttributes } from "react";
import {
  sanitizeFieldRestProps,
  useFieldValue,
  useRecordContext,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy } from "lucide-react";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { cn } from "@/lib/utils";

/**
 * Masked API-key display with reveal + copy buttons.
 *
 * Default masks all but the last 4 characters. Optional `scopesSource` renders
 * scope badges; optional `lastUsedSource` renders a relative timestamp.
 *
 * @example
 * <ApiKeyField source="apiKey" scopesSource="scopes" lastUsedSource="lastUsedAt" />
 */
export const ApiKeyField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  scopesSource,
  lastUsedSource,
  maskedFormat = "last4",
  className,
  ...rest
}: ApiKeyFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const ctx = useRecordContext<RecordType>({ record });
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (value == null) return null;
  const key = String(value);

  const masked =
    maskedFormat === "last4"
      ? `${"•".repeat(Math.max(0, key.length - 4))}${key.slice(-4)}`
      : "•".repeat(key.length);

  const scopes =
    scopesSource && ctx
      ? (ctx[scopesSource] as string[] | undefined)
      : undefined;
  const lastUsed =
    lastUsedSource && ctx
      ? (ctx[lastUsedSource] as string | null | undefined)
      : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={cn("inline-flex flex-col gap-1", className)}
    >
      <span className="inline-flex items-center gap-2">
        <span data-api-key className="font-mono text-sm">
          {revealed ? key : masked}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-api-key-reveal
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide API key" : "Reveal API key"}
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy API key"
        >
          <Copy className="h-4 w-4" />
        </Button>
        {copied && (
          <span className="text-xs text-muted-foreground">Copied!</span>
        )}
      </span>
      {scopes && scopes.length > 0 && (
        <span className="flex gap-1">
          {scopes.map((s) => (
            <span
              key={s}
              data-scope-badge
              className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
            >
              {s}
            </span>
          ))}
        </span>
      )}
      {lastUsedSource && (
        <span className="text-xs text-muted-foreground">
          Last used: {formatRelative(lastUsed)}
        </span>
      )}
    </span>
  );
};

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const delta = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const absSeconds = Math.abs(delta);
  if (absSeconds < 60) return rtf.format(Math.round(delta), "second");
  if (absSeconds < 3600) return rtf.format(Math.round(delta / 60), "minute");
  if (absSeconds < 86400) return rtf.format(Math.round(delta / 3600), "hour");
  if (absSeconds < 86400 * 30)
    return rtf.format(Math.round(delta / 86400), "day");
  return rtf.format(Math.round(delta / (86400 * 30)), "month");
}

export interface ApiKeyFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** Record field with scope strings. Renders chips when set. */
  scopesSource?: string;
  /** Record field with ISO last-used timestamp. */
  lastUsedSource?: string;
  /** 'last4' shows the trailing 4 chars; 'full' masks everything. */
  maskedFormat?: "last4" | "full";
}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 5/5.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/api-key-field.stories.tsx src/components/extras/api-key-field.tsx src/components/extras/api-key-field.spec.tsx src/components/extras/index.ts
git commit -m "feat(api-key-field): add ApiKeyField component + story + spec"
```

### Task 2.3: `<ApiKeyInput>` story

**Files:** Create `src/stories/extras/api-key-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { ApiKeyInput } from "@/components/admin";

export default { title: "Extras/ApiKeyInput" };

export const Basic = () => (
  <StoryAdmin record={{ apiKey: "sk_live_abc123" }}>
    <ApiKeyInput source="apiKey" />
  </StoryAdmin>
);

export const WithCustomRotate = () => (
  <StoryAdmin record={{ apiKey: "sk_live_abc123" }}>
    <ApiKeyInput
      source="apiKey"
      onRotate={async () => alert("Rotating key…")}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin record={{ apiKey: "sk_live_abc123" }}>
    <ApiKeyInput source="apiKey" disabled />
  </StoryAdmin>
);
```

### Task 2.4: Implement `<ApiKeyInput>` + spec

**Files:** Create `src/components/extras/api-key-input.tsx`, `src/components/extras/api-key-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Disabled } from "@/stories/extras/api-key-input.stories";

describe("<ApiKeyInput />", () => {
  it("renders a rotate button labelled with the source name", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent ?? "").toMatch(/rotate/i);
  });

  it("opens a confirmation dialog when rotate is clicked", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    btn.click();
    await expect.element(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/api-key-input.tsx
import { useState } from "react";
import { useRecordContext, useResourceContext, useUpdate } from "ra-core";
import type { RaRecord } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";

/**
 * API-key rotation control. Renders a single Rotate button that opens a
 * confirmation dialog. On confirm, calls `onRotate(record)` if provided, or
 * dispatches `useUpdate(resource, { id, data: { [source]: null } })` to
 * trigger server-side regeneration.
 *
 * @example
 * <ApiKeyInput source="apiKey" />
 * <ApiKeyInput source="apiKey" onRotate={async (record) => await regenKey(record.id)} />
 */
export const ApiKeyInput = (props: ApiKeyInputProps) => {
  const { source, onRotate, disabled, resource: resourceProp } = props;
  const record = useRecordContext();
  const resource = useResourceContext({ resource: resourceProp });
  const [update] = useUpdate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleRotate = async () => {
    setPending(true);
    try {
      if (onRotate && record) {
        await onRotate(record);
      } else if (record) {
        await update(resource, {
          id: record.id,
          data: { [source]: null },
          previousData: record,
        });
      }
    } finally {
      setPending(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-rotate-button
          disabled={disabled}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Rotate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rotate API key?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? The current key will be revoked immediately. Any
            integrations still using it will break until they're updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRotate} disabled={pending}>
            {pending ? "Rotating…" : "Rotate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export interface ApiKeyInputProps {
  /** Record field holding the API key. Defaults to `"apiKey"`. */
  source: string;
  /** Override resource. */
  resource?: string;
  /** Async side-effect on rotate. When provided, replaces the default useUpdate call. */
  onRotate?: (record: RaRecord) => Promise<void> | void;
  /** Disable the button. */
  disabled?: boolean;
}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/api-key-input.stories.tsx src/components/extras/api-key-input.tsx src/components/extras/api-key-input.spec.tsx src/components/extras/index.ts
git commit -m "feat(api-key-input): add ApiKeyInput component + story + spec"
```

### Task 2.5: Doc pages

**Files:** Create `docs/src/content/docs/api-key-field.md`, `docs/src/content/docs/api-key-input.md`

- [ ] **Step 1** — write `api-key-field.md`:

````markdown
---
title: "ApiKeyField"
---

Masked API-key display with reveal + copy buttons. Optional scope chips and
relative "last used" timestamp.

## Usage

```tsx
import { ApiKeyField } from '@/components/admin';

<ApiKeyField source="apiKey" />
<ApiKeyField
  source="apiKey"
  scopesSource="scopes"
  lastUsedSource="lastUsedAt"
/>
```

## Props

| Prop             | Required | Type                | Default   | Description                      |
| ---------------- | -------- | ------------------- | --------- | -------------------------------- |
| `source`         | Required | `string`            | -         | Record field with the key        |
| `scopesSource`   | Optional | `string`            | -         | Sibling field with scope strings |
| `lastUsedSource` | Optional | `string`            | -         | Sibling field with ISO timestamp |
| `maskedFormat`   | Optional | `"last4" \| "full"` | `"last4"` | Masking strategy                 |
| `className`      | Optional | `string`            | -         | CSS class                        |

## Reveal

Reveal/hide toggles per render — the unmasked state lives in component state,
not in the record. Closing and reopening the view re-masks.
````

- [ ] **Step 2** — write `api-key-input.md`:

````markdown
---
title: "ApiKeyInput"
---

API-key rotation control. Renders a Rotate button that opens a confirmation
dialog. On confirm, fires `onRotate(record)` if provided, or sets the source
field to `null` so the server-side hook regenerates the key.

## Usage

```tsx
import { ApiKeyInput } from '@/components/admin';

<ApiKeyInput source="apiKey" />
<ApiKeyInput
  source="apiKey"
  onRotate={async (record) => await regenKeyServerSide(record.id)}
/>
```

## Props

| Prop       | Required | Type                                | Default | Description          |
| ---------- | -------- | ----------------------------------- | ------- | -------------------- |
| `source`   | Required | `string`                            | -       | Record field         |
| `resource` | Optional | `string`                            | Context | Override resource    |
| `onRotate` | Optional | `(record) => Promise<void> \| void` | -       | Custom rotation hook |
| `disabled` | Optional | `boolean`                           | `false` | Disable button       |

## Default rotation behavior

Without `onRotate`, the button calls `useUpdate(resource, { id, data: { [source]: null }, previousData })`. The server-side mutation is expected to regenerate the key and return the new value in the next read.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/api-key-field.md docs/src/content/docs/api-key-input.md
git commit -m "docs(api-key): add ApiKeyField + ApiKeyInput documentation"
```

---

## Component 3: WebhookEndpoint (Field + Input)

URL + secret + event-types composite. Field renders URL + status badge; input edits the composite.

### Task 3.1: `<WebhookEndpointField>` story

**Files:** Create `src/stories/extras/webhook-endpoint-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { WebhookEndpointField } from "@/components/admin";

export default { title: "Extras/WebhookEndpointField" };

const recordOk = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created", "order.updated"],
    lastDelivery: { status: "ok", at: new Date().toISOString() },
  },
};

const recordFailed = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created"],
    lastDelivery: { status: "failed", at: new Date().toISOString() },
  },
};

const recordPending = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created"],
  },
};

export const Basic = () => (
  <StoryAdmin record={recordOk}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);

export const Failed = () => (
  <StoryAdmin record={recordFailed}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);

export const Pending = () => (
  <StoryAdmin record={recordPending}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);
```

### Task 3.2: Implement `<WebhookEndpointField>` + spec

**Files:** Create `src/components/extras/webhook-endpoint-field.tsx`, `src/components/extras/webhook-endpoint-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Failed,
  Pending,
} from "@/stories/extras/webhook-endpoint-field.stories";

describe("<WebhookEndpointField />", () => {
  it("renders the URL and an OK status badge for a successful last delivery", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("https://example.com/webhook"))
      .toBeInTheDocument();
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("ok");
  });

  it("flags failed status when lastDelivery.status is 'failed'", async () => {
    const screen = render(<Failed />);
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("failed");
  });

  it("falls back to pending when lastDelivery is undefined", async () => {
    const screen = render(<Pending />);
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("pending");
  });

  it("never renders the secret", async () => {
    const screen = render(<Basic />);
    expect(screen.container.textContent ?? "").not.toContain("whsec_abc");
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/webhook-endpoint-field.tsx
import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue } from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { cn } from "@/lib/utils";

export interface WebhookEndpoint {
  url: string;
  secret: string;
  eventTypes: readonly string[];
  lastDelivery?: {
    status: "ok" | "failed" | "pending";
    at: string;
  };
}

type DeliveryStatus = "ok" | "failed" | "pending";

/**
 * Displays a webhook endpoint's URL and last-delivery status badge.
 * The signing secret is never rendered.
 *
 * @example
 * <WebhookEndpointField source="endpoint" />
 */
export const WebhookEndpointField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  className,
  ...rest
}: WebhookEndpointFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });

  if (!value || typeof value !== "object") return null;
  const endpoint = value as WebhookEndpoint;
  const status: DeliveryStatus = endpoint.lastDelivery?.status ?? "pending";

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="font-mono text-sm">{endpoint.url}</span>
      <span
        data-webhook-status
        data-status={status}
        className={cn(
          "rounded px-2 py-0.5 text-xs font-medium",
          status === "ok" && "bg-green-500/10 text-green-700",
          status === "failed" && "bg-red-500/10 text-red-700",
          status === "pending" && "bg-muted text-muted-foreground",
        )}
      >
        {status.toUpperCase()}
      </span>
    </span>
  );
};

export interface WebhookEndpointFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/webhook-endpoint-field.stories.tsx src/components/extras/webhook-endpoint-field.tsx src/components/extras/webhook-endpoint-field.spec.tsx src/components/extras/index.ts
git commit -m "feat(webhook-endpoint-field): add WebhookEndpointField component + story + spec"
```

### Task 3.3: `<WebhookEndpointInput>` story

**Files:** Create `src/stories/extras/webhook-endpoint-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { WebhookEndpointInput } from "@/components/admin";

export default { title: "Extras/WebhookEndpointInput" };

const EVENT_TYPES = [
  "order.created",
  "order.updated",
  "order.cancelled",
  "user.created",
  "user.deleted",
];

const record = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc123",
    eventTypes: ["order.created"],
  },
};

export const Basic = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
  </StoryAdmin>
);

export const WithTestPing = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput
      source="endpoint"
      eventTypes={EVENT_TYPES}
      onTestPing={async (url) => alert(`POST ${url}`)}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} disabled />
  </StoryAdmin>
);
```

### Task 3.4: Implement `<WebhookEndpointInput>` + spec

**Files:** Create `src/components/extras/webhook-endpoint-input.tsx`, `src/components/extras/webhook-endpoint-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  WithTestPing,
} from "@/stories/extras/webhook-endpoint-input.stories";

describe("<WebhookEndpointInput />", () => {
  it("renders URL + secret inputs bound to the composite", async () => {
    const screen = render(<Basic />);
    const url = screen.container.querySelector(
      "input[data-webhook-url]",
    ) as HTMLInputElement;
    const secret = screen.container.querySelector(
      "input[data-webhook-secret]",
    ) as HTMLInputElement;
    expect(url.value).toBe("https://example.com/webhook");
    expect(secret.value).toBe("whsec_abc123");
  });

  it("renders one checkbox per supported event type", async () => {
    const screen = render(<Basic />);
    const cbs = screen.container.querySelectorAll("[data-event-checkbox]");
    expect(cbs.length).toBe(5);
  });

  it("hides the test-ping button when no onTestPing is provided", async () => {
    const screen = render(<Basic />);
    expect(
      screen.container.querySelector("[data-test-ping-button]"),
    ).toBeNull();
  });

  it("shows the test-ping button when onTestPing is set", async () => {
    const screen = render(<WithTestPing />);
    const btn = screen.container.querySelector("[data-test-ping-button]");
    expect(btn).toBeTruthy();
  });

  it("respects disabled prop", async () => {
    const screen = render(<Disabled />);
    const url = screen.container.querySelector(
      "input[data-webhook-url]",
    ) as HTMLInputElement;
    expect(url.disabled).toBe(true);
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/webhook-endpoint-input.tsx
import { useState } from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { InputHelperText } from "@/components/admin/input-helper-text";
import type { WebhookEndpoint } from "./webhook-endpoint-field";
import { cn } from "@/lib/utils";

/**
 * Composite input for a webhook endpoint. Edits the URL, signing secret, and
 * event-type subscriptions. Optionally renders a test-ping button.
 *
 * Storage shape: `{ url, secret, eventTypes, lastDelivery? }`.
 *
 * @example
 * <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
 */
export const WebhookEndpointInput = (props: WebhookEndpointInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    eventTypes,
    onTestPing,
    disabled,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const value = (field.value as WebhookEndpoint | null) ?? {
    url: "",
    secret: "",
    eventTypes: [],
  };

  const [pinging, setPinging] = useState(false);

  const update = (patch: Partial<WebhookEndpoint>) => {
    field.onChange({ ...value, ...patch });
  };

  const toggleEvent = (event: string, checked: boolean) => {
    const set = new Set(value.eventTypes);
    if (checked) set.add(event);
    else set.delete(event);
    update({ eventTypes: Array.from(set) });
  };

  const handlePing = async () => {
    if (!onTestPing) return;
    setPinging(true);
    try {
      await onTestPing(value.url, value.secret);
    } finally {
      setPinging(false);
    }
  };

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div className={cn("flex flex-col gap-3", className)}>
          <Input
            type="url"
            data-webhook-url
            value={value.url}
            onChange={(e) => update({ url: e.target.value })}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder="https://example.com/webhook"
          />
          <Input
            type="password"
            data-webhook-secret
            value={value.secret}
            onChange={(e) => update({ secret: e.target.value })}
            disabled={disabled}
            placeholder="Signing secret"
          />
          <div className="flex flex-wrap gap-3">
            {eventTypes.map((event) => (
              <label
                key={event}
                className="flex items-center gap-2 text-sm font-mono"
              >
                <Checkbox
                  data-event-checkbox
                  checked={value.eventTypes.includes(event)}
                  onCheckedChange={(c) => toggleEvent(event, c === true)}
                  disabled={disabled}
                />
                {event}
              </label>
            ))}
          </div>
          {onTestPing && (
            <Button
              type="button"
              variant="outline"
              data-test-ping-button
              onClick={handlePing}
              disabled={disabled || pinging || !value.url}
            >
              {pinging ? "Pinging…" : "Send test ping"}
            </Button>
          )}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface WebhookEndpointInputProps extends InputProps {
  /** Available event-type strings to surface as checkboxes. */
  eventTypes: readonly string[];
  /** Optional test-ping handler. When set, renders the test-ping button. */
  onTestPing?: (url: string, secret: string) => Promise<void> | void;
  disabled?: boolean;
}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 5/5.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/webhook-endpoint-input.stories.tsx src/components/extras/webhook-endpoint-input.tsx src/components/extras/webhook-endpoint-input.spec.tsx src/components/extras/index.ts
git commit -m "feat(webhook-endpoint-input): add WebhookEndpointInput component + story + spec"
```

### Task 3.5: Doc pages

**Files:** Create `docs/src/content/docs/webhook-endpoint-field.md`, `docs/src/content/docs/webhook-endpoint-input.md`

- [ ] **Step 1** — write `webhook-endpoint-field.md`:

````markdown
---
title: "WebhookEndpointField"
---

Displays a webhook endpoint's URL and last-delivery status badge. The signing
secret is never rendered.

## Usage

```tsx
import { WebhookEndpointField } from "@/components/admin";

<WebhookEndpointField source="endpoint" />;
```

## Storage shape

```ts
interface WebhookEndpoint {
  url: string;
  secret: string;
  eventTypes: readonly string[];
  lastDelivery?: { status: "ok" | "failed" | "pending"; at: string };
}
```

## Status badge

| Status    | Color | Source                                              |
| --------- | ----- | --------------------------------------------------- |
| `ok`      | green | `lastDelivery.status === "ok"`                      |
| `failed`  | red   | `lastDelivery.status === "failed"`                  |
| `pending` | muted | `lastDelivery` is missing or `status === "pending"` |
````

- [ ] **Step 2** — write `webhook-endpoint-input.md`:

````markdown
---
title: "WebhookEndpointInput"
---

Composite input for a webhook endpoint. Edits the URL, signing secret, and
event-type subscriptions. Optionally renders a test-ping button.

## Usage

```tsx
import { WebhookEndpointInput } from '@/components/admin';

const EVENT_TYPES = ["order.created", "order.updated", "user.created"];

<WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
<WebhookEndpointInput
  source="endpoint"
  eventTypes={EVENT_TYPES}
  onTestPing={async (url, secret) => {
    await fetch("/api/webhook-ping", { method: "POST", body: JSON.stringify({ url, secret }) });
  }}
/>
```

## Props

| Prop         | Required | Type                                     | Default  | Description       |
| ------------ | -------- | ---------------------------------------- | -------- | ----------------- |
| `source`     | Required | `string`                                 | -        | Form field        |
| `eventTypes` | Required | `readonly string[]`                      | -        | Selectable events |
| `onTestPing` | Optional | `(url, secret) => Promise<void> \| void` | -        | Test-ping handler |
| `disabled`   | Optional | `boolean`                                | `false`  | Disable inputs    |
| `label`      | Optional | `string \| false`                        | Inferred | Custom label      |
| `helperText` | Optional | `ReactNode`                              | -        | Helper text       |

## Storage shape

Composite object — see `<WebhookEndpointField>` for the type definition.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/webhook-endpoint-field.md docs/src/content/docs/webhook-endpoint-input.md
git commit -m "docs(webhook-endpoint): add WebhookEndpointField + WebhookEndpointInput documentation"
```

---

## Component 4: CommentsThread

Record-attached threaded discussion. Reads `comments` sub-resource via `useGetList`.

### Task 4.1: Story file

**Files:** Create `src/stories/extras/comments-thread.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  RecordContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { CommentsThread, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const records = {
  posts: [{ id: 1, title: "My post" }],
  comments: [
    {
      id: 1,
      parentId: 1,
      authorId: "alice",
      authorName: "Alice",
      body: "Looks good to me.",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 2,
      parentId: 1,
      authorId: "bob",
      authorName: "Bob",
      body: "Let's also bump the version.",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      parentId: 99,
      authorId: "carol",
      authorName: "Carol",
      body: "Unrelated comment",
      createdAt: new Date().toISOString(),
    },
  ],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(records, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <RecordContextProvider value={{ id: 1, title: "My post" }}>
          {children}
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/CommentsThread" };

export const Basic = () => (
  <Wrapper>
    <CommentsThread reference="comments" target="parentId" />
  </Wrapper>
);

export const Resolvable = () => (
  <Wrapper>
    <CommentsThread reference="comments" target="parentId" resolvable />
  </Wrapper>
);

export const Empty = () => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ comments: [] }, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <RecordContextProvider value={{ id: 42, title: "Lonely post" }}>
          <CommentsThread reference="comments" target="parentId" />
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);
```

### Task 4.2: Implement `<CommentsThread>` + spec

**Files:** Create `src/components/extras/comments-thread.tsx`, `src/components/extras/comments-thread.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  Resolvable,
} from "@/stories/extras/comments-thread.stories";

describe("<CommentsThread />", () => {
  it("renders one card per comment matching the parent", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Looks good to me."))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Let's also bump the version."))
      .toBeInTheDocument();
    // Unrelated comment with parentId=99 should NOT render
    expect(screen.container.textContent ?? "").not.toContain(
      "Unrelated comment",
    );
  });

  it("renders the author name on each card", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Alice")).toBeInTheDocument();
    await expect.element(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows a 'Mark resolved' button when resolvable prop is set", async () => {
    const screen = render(<Resolvable />);
    const btn = screen.container.querySelector("[data-resolve-button]");
    expect(btn).toBeTruthy();
  });

  it("renders empty state when there are no comments", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByText(/no comments yet/i))
      .toBeInTheDocument();
  });

  it("renders a new-comment textarea", async () => {
    const screen = render(<Basic />);
    const ta = screen.container.querySelector(
      "textarea[data-new-comment-body]",
    ) as HTMLTextAreaElement;
    expect(ta).toBeTruthy();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/comments-thread.tsx
import { useState } from "react";
import {
  useCreate,
  useGetIdentity,
  useGetList,
  useRecordContext,
  useUpdate,
} from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface Comment {
  id: string | number;
  parentId: string | number;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string;
  resolvedAt?: string | null;
}

/**
 * Record-attached threaded comments. Reads the `reference` sub-resource
 * filtered by `target=record.id`. Renders one card per comment plus a
 * new-comment textarea.
 *
 * Edit/delete is restricted to the comment author. Optional `resolvable` prop
 * adds a "Mark resolved" button per comment.
 *
 * @example
 * <CommentsThread reference="comments" target="parentId" />
 */
export const CommentsThread = (props: CommentsThreadProps) => {
  const { reference, target, resolvable = false } = props;
  const record = useRecordContext();
  const { identity } = useGetIdentity();
  const [create] = useCreate();
  const [update] = useUpdate();
  const [body, setBody] = useState("");

  const { data: comments = [], isLoading } = useGetList<Comment>(reference, {
    filter: record ? { [target]: record.id } : { __none: true },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "createdAt", order: "ASC" },
  });

  if (!record || isLoading) return null;

  const handlePost = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    await create(reference, {
      data: {
        [target]: record.id,
        authorId: identity?.id ?? "anonymous",
        authorName: identity?.fullName,
        body: trimmed,
        createdAt: new Date().toISOString(),
      },
    });
    setBody("");
  };

  const handleResolve = (comment: Comment) => {
    update(reference, {
      id: comment.id,
      data: { resolvedAt: new Date().toISOString() },
      previousData: comment,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first.
          </CardContent>
        </Card>
      ) : (
        comments.map((c) => (
          <Card key={c.id} className={cn(c.resolvedAt && "opacity-60")}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {c.authorName ?? c.authorId}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {resolvable && !c.resolvedAt && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-resolve-button
                    onClick={() => handleResolve(c)}
                  >
                    Mark resolved
                  </Button>
                )}
                {c.resolvedAt && (
                  <span className="text-xs text-muted-foreground">
                    Resolved {new Date(c.resolvedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            </CardContent>
          </Card>
        ))
      )}
      <div className="flex flex-col gap-2">
        <Textarea
          data-new-comment-body
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            data-post-comment
            onClick={handlePost}
            disabled={!body.trim()}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface CommentsThreadProps {
  /** Comments sub-resource name (e.g. "comments"). */
  reference: string;
  /** Field on the comment record that holds the parent record id. */
  target: string;
  /** When true, each unresolved comment shows a "Mark resolved" button. */
  resolvable?: boolean;
}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 5/5.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/comments-thread.stories.tsx src/components/extras/comments-thread.tsx src/components/extras/comments-thread.spec.tsx src/components/extras/index.ts
git commit -m "feat(comments-thread): add CommentsThread component + story + spec"
```

### Task 4.3: Doc page

**Files:** Create `docs/src/content/docs/comments-thread.md`

- [ ] **Step 1** — write:

````markdown
---
title: "CommentsThread"
---

Record-attached threaded discussion. Reads a `comments` sub-resource via
`useGetList`, filtered by the parent record's id. Renders one card per
comment plus a new-comment textarea.

## Usage

```tsx
import { CommentsThread, Show } from "@/components/admin";

const PostShow = () => (
  <Show>
    <CommentsThread reference="comments" target="parentId" resolvable />
  </Show>
);
```

## Comment record shape

```ts
interface Comment {
  id: string | number;
  parentId: string | number;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string; // ISO timestamp
  resolvedAt?: string | null;
}
```

## Props

| Prop         | Required | Type      | Default | Description                             |
| ------------ | -------- | --------- | ------- | --------------------------------------- |
| `reference`  | Required | `string`  | -       | Comments sub-resource name              |
| `target`     | Required | `string`  | -       | Field on comment that holds parent id   |
| `resolvable` | Optional | `boolean` | `false` | Show "Mark resolved" button per comment |

## Required parent context

`<CommentsThread>` must be rendered inside a `<RecordContextProvider>` (e.g. inside `<Show>` or `<Edit>`).
````

- [ ] **Step 2** — commit:

```bash
git add docs/src/content/docs/comments-thread.md
git commit -m "docs(comments-thread): add documentation"
```

---

## Component 5: DualApprovalButton

4-eyes principle. Two distinct approvers required. Self-approval blocked.

### Task 5.1: Story file

**Files:** Create `src/stories/extras/dual-approval-button.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  RecordContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { DualApprovalButton, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const baseRecords = {
  expenses: [{ id: 1, title: "Travel", status: "pending", approvers: [] }],
};

const authProvider = (currentUserId: string) => ({
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => [],
  getIdentity: async () => ({ id: currentUserId, fullName: currentUserId }),
});

const Wrapper = ({
  children,
  approvers = [],
  currentUserId = "alice",
}: {
  children: React.ReactNode;
  approvers?: string[];
  currentUserId?: string;
}) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(baseRecords, false)}
        authProvider={authProvider(currentUserId)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <RecordContextProvider
          value={{ id: 1, title: "Travel", status: "pending", approvers }}
        >
          {children}
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/DualApprovalButton" };

export const Basic = () => (
  <Wrapper>
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const FirstApproverPending = () => (
  <Wrapper approvers={["bob"]} currentUserId="alice">
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const SelfApprovalBlocked = () => (
  <Wrapper approvers={["alice"]} currentUserId="alice">
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const ThresholdReached = () => (
  <Wrapper approvers={["alice", "bob"]} currentUserId="carol">
    <DualApprovalButton required={2} />
  </Wrapper>
);
```

### Task 5.2: Implement `<DualApprovalButton>` + spec

**Files:** Create `src/components/extras/dual-approval-button.tsx`, `src/components/extras/dual-approval-button.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  FirstApproverPending,
  SelfApprovalBlocked,
  ThresholdReached,
} from "@/stories/extras/dual-approval-button.stories";

describe("<DualApprovalButton />", () => {
  it("renders an enabled approve button with 0/2 count", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector(
      "[data-dual-approve]",
    ) as HTMLButtonElement;
    // wait for identity to resolve before asserting state
    await expect.element(screen.getByText(/0 of 2/i)).toBeInTheDocument();
    expect(btn.disabled).toBe(false);
  });

  it("renders 1/2 when one approver is already recorded", async () => {
    const screen = render(<FirstApproverPending />);
    await expect.element(screen.getByText(/1 of 2/i)).toBeInTheDocument();
  });

  it("disables the button when the current user already approved", async () => {
    const screen = render(<SelfApprovalBlocked />);
    await expect
      .element(screen.getByText(/already approved/i))
      .toBeInTheDocument();
    const btn = screen.container.querySelector(
      "[data-dual-approve]",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("renders a 'Fully approved' badge when the threshold is met", async () => {
    const screen = render(<ThresholdReached />);
    await expect
      .element(screen.getByText(/fully approved/i))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/dual-approval-button.tsx
import {
  useGetIdentity,
  useRecordContext,
  useResourceContext,
  useUpdate,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

/**
 * Four-eyes / segregation-of-duties approval button. Records each approver's
 * id in the `approverSource` array on the record; once the count reaches
 * `required`, the record's status field flips to `approved`.
 *
 * Blocks self-approval: a user already in the array sees a disabled button.
 *
 * @example
 * <DualApprovalButton required={2} />
 */
export const DualApprovalButton = (props: DualApprovalButtonProps) => {
  const {
    required = 2,
    approverSource = "approvers",
    statusSource = "status",
    resource: resourceProp,
  } = props;
  const record = useRecordContext<{
    id: string | number;
    approvers?: readonly string[];
    [key: string]: unknown;
  }>();
  const resource = useResourceContext({ resource: resourceProp });
  const { identity } = useGetIdentity();
  const [update] = useUpdate();

  if (!record) return null;

  const approvers = (record[approverSource] as string[] | undefined) ?? [];
  const count = approvers.length;
  const currentUserId = identity?.id != null ? String(identity.id) : undefined;
  const alreadyApproved = currentUserId
    ? approvers.includes(currentUserId)
    : false;
  const reached = count >= required;

  const handleApprove = () => {
    if (!currentUserId || alreadyApproved || reached) return;
    const nextApprovers = [...approvers, currentUserId];
    const nextStatus =
      nextApprovers.length >= required ? "approved" : "pending";
    update(resource, {
      id: record.id,
      data: {
        [approverSource]: nextApprovers,
        [statusSource]: nextStatus,
      },
      previousData: record,
    });
  };

  if (reached) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
        <Check className="h-4 w-4" /> Fully approved ({count} of {required})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        data-dual-approve
        onClick={handleApprove}
        disabled={alreadyApproved || !currentUserId}
        title={alreadyApproved ? "You already approved" : undefined}
      >
        <Check className="mr-1 h-4 w-4" /> Approve
      </Button>
      <span className="text-sm text-muted-foreground">
        {count} of {required}
      </span>
      {alreadyApproved && (
        <span className="text-xs text-muted-foreground">
          You already approved
        </span>
      )}
    </span>
  );
};

export interface DualApprovalButtonProps {
  /** Total approvers required. Default `2`. */
  required?: number;
  /** Record field with the approver id array. Default `"approvers"`. */
  approverSource?: string;
  /** Record field updated to `"approved"` when threshold reached. Default `"status"`. */
  statusSource?: string;
  /** Override resource. */
  resource?: string;
}
```

- [ ] **Step 4** — append export to `extras/index.ts`.
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/extras/dual-approval-button.stories.tsx src/components/extras/dual-approval-button.tsx src/components/extras/dual-approval-button.spec.tsx src/components/extras/index.ts
git commit -m "feat(dual-approval-button): add DualApprovalButton component + story + spec"
```

### Task 5.3: Doc page

**Files:** Create `docs/src/content/docs/dual-approval-button.md`

- [ ] **Step 1** — write:

````markdown
---
title: "DualApprovalButton"
---

Four-eyes / segregation-of-duties approval button. Each click adds the current
user's id to an approver array on the record; once the count reaches
`required`, the status flips to `approved`. Self-approval is blocked.

## Usage

```tsx
import { DualApprovalButton, Show, RecordField } from "@/components/admin";

const ExpenseShow = () => (
  <Show>
    <RecordField source="title" />
    <DualApprovalButton required={2} />
  </Show>
);
```

## Props

| Prop             | Required | Type     | Default       | Description                                |
| ---------------- | -------- | -------- | ------------- | ------------------------------------------ |
| `required`       | Optional | `number` | `2`           | Approvers needed                           |
| `approverSource` | Optional | `string` | `"approvers"` | Field for the approver id array            |
| `statusSource`   | Optional | `string` | `"status"`    | Field flipped to `"approved"` on threshold |
| `resource`       | Optional | `string` | Context       | Override resource                          |

## Record shape

The record must carry an array field (default name `approvers`) holding the
ids of users who have already approved. When `approvers.length >= required`,
the button renders a "Fully approved" badge instead of the action button.

## Self-approval blocking

`useGetIdentity()` provides the current user's id. If that id is already in
`approvers`, the button is disabled with a "You already approved" tooltip.
````

- [ ] **Step 2** — commit:

```bash
git add docs/src/content/docs/dual-approval-button.md
git commit -m "docs(dual-approval-button): add documentation"
```

---

## Final task: Sidebar + batch verification

- [ ] **Step 1** — add 9 sidebar entries in `docs/sidebar.config.mjs` under the existing **Extras** section in alpha order:

```
"api-key-field",
"api-key-input",
"comments-thread",
"dual-approval-button",
"subscription-plan-field",
"subscription-plan-picker",
"webhook-endpoint-field",
"webhook-endpoint-input",
```

(Insert between existing Extras entries in alpha position.)

- [ ] **Step 2** — run all doc-drift scripts (from `docs/` dir):

```bash
pnpm run check-docs
pnpm run check-sidebar
pnpm run check-stories
pnpm run check-specs
```

Expected: all green.

- [ ] **Step 3** — run lint + typecheck + full test suite in parallel:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

Expected: 0 errors, all suites green.

- [ ] **Step 4** — commit sidebar update:

```bash
git add docs/sidebar.config.mjs
git commit -m "docs(sidebar): add Tier 3 SaaS / collab components"
```

- [ ] **Step 5** — final log check:

```bash
git log main..HEAD --oneline
```

---

## Out of scope (v1)

- **`<SubscriptionPlanPicker>`**: proration math, upgrade/downgrade confirmation dialog, fetched-plans (`useGetList`) variant.
- **`<ApiKeyField>`**: pre-mask reveal threshold (e.g. show first 3 + last 4 chars).
- **`<ApiKeyInput>`**: new-key generation flow with copy-once UX. Currently only handles rotation.
- **`<WebhookEndpointInput>`**: combobox-based event-type picker for large event lists.
- **`<WebhookEndpointInput>`**: delivery history sub-table.
- **`<CommentsThread>`**: nested replies, @mention autocomplete during typing, styled mention chips.
- **`<CommentsThread>`**: edit / delete UI (only restricted to author when shipped).
- **`<DualApprovalButton>`**: reject flow with reason capture (use `<ApprovalQueue>` for that).
- **`<DualApprovalButton>`**: separate audit-history record per approval.

---

## Self-review notes

- All seven components live in `src/components/extras/`.
- Stories live at `src/stories/extras/*.stories.tsx` with `Extras/<Component>` title prefix.
- Specs import story exports.
- Field/input pairs follow the established `<name>-field.tsx` + `<name>-input.tsx` precedent.
- Standalone components (`<CommentsThread>`, `<DualApprovalButton>`) use inline wrappers in their story files because they consume `<RecordContext>` plus a specific `authProvider` or `dataProvider` shape that the shared `StoryAdmin` helper doesn't provide.
- No new runtime deps.
- Cards/badges/buttons are pure composition over shadcn primitives — no design-system inventions.
- All seven components honor the `disabled` prop where applicable.
- All record-field exports are typed via `FieldProps<RecordType>` extending pattern.

## Execution handoff

Plan saved at `docs/superpowers/plans/2026-05-16-tier-3-saas-domain-components.md`.

The seven components map to **five subagent dispatches**:

1. SubscriptionPlanField + SubscriptionPlanPicker (Task 1.1 → 1.5)
2. ApiKeyField + ApiKeyInput (Task 2.1 → 2.5)
3. WebhookEndpointField + WebhookEndpointInput (Task 3.1 → 3.5)
4. CommentsThread (Task 4.1 → 4.3)
5. DualApprovalButton (Task 5.1 → 5.3)

Recommended: **subagent-driven-development, 5 dispatches in parallel, worktree-isolated**, same as T1/T2.
