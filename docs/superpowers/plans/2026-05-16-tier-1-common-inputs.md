# Tier 1 Common Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five admin field+input pairs that every admin app eventually needs — `<RatingField>`/`<RatingInput>`, `<ColorField>`/`<ColorInput>`, `<CurrencyField>`/`<CurrencyInput>`, `<DurationField>`/`<DurationInput>`, `<PhoneField>`/`<PhoneInput>` — using the established `useFieldValue`/`useInput` patterns and the `StoryAdmin` test wrapper.

**Architecture:** Each component pair lives in two sibling files (`<name>-field.tsx`, `<name>-input.tsx`) under `src/components/admin/`, follows the existing `number-field.tsx`/`number-input.tsx` precedent, and is exported from `src/components/admin/index.ts`. Each pair gets a single `<name>.stories.tsx` (under `src/stories/admin/`) using the shared `StoryAdmin` helper, a `<name>.spec.tsx` co-located with the components that imports story exports, and a single `<name>.md` doc page. Tier 1 ships the five pairs together as a "common inputs" batch; the five pairs are independent and can be implemented in parallel.

**Tech Stack:** React 19, TypeScript, ra-core (`useInput`, `useFieldValue`, `useTranslate`, `FieldTitle`), shadcn/ui (`Input`, `Popover`, `Slider`, `Button`), Tailwind v4, Vitest + Playwright browser provider. New runtime deps: `libphonenumber-js` (for `<PhoneInput>` + `<PhoneField>`). All other components use only built-in `Intl`, `date-fns` (already transitive via ra-core), and native HTML inputs.

**Spec:** [docs/superpowers/specs/2026-05-16-twenty-one-component-ideas-design.md](../specs/2026-05-16-twenty-one-component-ideas-design.md) — Tier 1 batch (ideas 6, 7, 8, 9, 10).

---

## File structure

| File                                           | Responsibility                  | Status                       |
| ---------------------------------------------- | ------------------------------- | ---------------------------- |
| `package.json`                                 | Add `libphonenumber-js` dep     | **Modify** (Phone task only) |
| `src/components/admin/rating-field.tsx`        | Star rating display field       | **Create**                   |
| `src/components/admin/rating-input.tsx`        | Star rating input               | **Create**                   |
| `src/components/admin/rating-field.spec.tsx`   | Browser tests                   | **Create**                   |
| `src/components/admin/rating-input.spec.tsx`   | Browser tests                   | **Create**                   |
| `src/stories/admin/rating-field.stories.tsx`   | Stories                         | **Create**                   |
| `src/stories/admin/rating-input.stories.tsx`   | Stories                         | **Create**                   |
| `docs/src/content/docs/rating-field.md`        | Doc page                        | **Create**                   |
| `docs/src/content/docs/rating-input.md`        | Doc page                        | **Create**                   |
| `src/components/admin/color-field.tsx`         | Hex/oklch/rgb color display     | **Create**                   |
| `src/components/admin/color-input.tsx`         | Color picker input              | **Create**                   |
| `src/components/admin/color-field.spec.tsx`    | Browser tests                   | **Create**                   |
| `src/components/admin/color-input.spec.tsx`    | Browser tests                   | **Create**                   |
| `src/stories/admin/color-field.stories.tsx`    | Stories                         | **Create**                   |
| `src/stories/admin/color-input.stories.tsx`    | Stories                         | **Create**                   |
| `docs/src/content/docs/color-field.md`         | Doc page                        | **Create**                   |
| `docs/src/content/docs/color-input.md`         | Doc page                        | **Create**                   |
| `src/components/admin/currency-field.tsx`      | Locale-aware money display      | **Create**                   |
| `src/components/admin/currency-input.tsx`      | Locale-aware money input        | **Create**                   |
| `src/components/admin/currency-field.spec.tsx` | Browser tests                   | **Create**                   |
| `src/components/admin/currency-input.spec.tsx` | Browser tests                   | **Create**                   |
| `src/stories/admin/currency-field.stories.tsx` | Stories                         | **Create**                   |
| `src/stories/admin/currency-input.stories.tsx` | Stories                         | **Create**                   |
| `docs/src/content/docs/currency-field.md`      | Doc page                        | **Create**                   |
| `docs/src/content/docs/currency-input.md`      | Doc page                        | **Create**                   |
| `src/components/admin/duration-field.tsx`      | ISO-8601 duration display       | **Create**                   |
| `src/components/admin/duration-input.tsx`      | ISO-8601 duration input         | **Create**                   |
| `src/components/admin/duration-field.spec.tsx` | Browser tests                   | **Create**                   |
| `src/components/admin/duration-input.spec.tsx` | Browser tests                   | **Create**                   |
| `src/stories/admin/duration-field.stories.tsx` | Stories                         | **Create**                   |
| `src/stories/admin/duration-input.stories.tsx` | Stories                         | **Create**                   |
| `docs/src/content/docs/duration-field.md`      | Doc page                        | **Create**                   |
| `docs/src/content/docs/duration-input.md`      | Doc page                        | **Create**                   |
| `src/components/admin/phone-field.tsx`         | E.164 phone display             | **Create**                   |
| `src/components/admin/phone-input.tsx`         | Phone input w/ country selector | **Create**                   |
| `src/components/admin/phone-field.spec.tsx`    | Browser tests                   | **Create**                   |
| `src/components/admin/phone-input.spec.tsx`    | Browser tests                   | **Create**                   |
| `src/stories/admin/phone-field.stories.tsx`    | Stories                         | **Create**                   |
| `src/stories/admin/phone-input.stories.tsx`    | Stories                         | **Create**                   |
| `docs/src/content/docs/phone-field.md`         | Doc page                        | **Create**                   |
| `docs/src/content/docs/phone-input.md`         | Doc page                        | **Create**                   |
| `src/components/admin/index.ts`                | Re-export the 10 new components | **Modify**                   |

---

## Shared conventions (read before any task)

These conventions apply to every component pair in this plan. Re-read them in each subagent prompt.

### Field component canonical shape

Follow `src/components/admin/number-field.tsx`:

- Generic over `<RecordType extends UnknownRecord = UnknownRecord>`.
- Destructure `defaultValue, source, record, empty, ...rest`.
- Call `useFieldValue({ defaultValue, source, record })`.
- Render `null` when value is `null`/`undefined` and `empty` is not set.
- Render `<span>{ empty }</span>` when value is empty and `empty` is set (translate if string).
- Spread `sanitizeFieldRestProps(rest)` onto the root element.
- Export a `<Name>FieldProps<RecordType>` interface that extends `FieldProps<RecordType>` and the wrapper HTML element's props.

### Input component canonical shape

Follow `src/components/admin/number-input.tsx`:

- Destructure `label, source, className, resource: resourceProp, helperText, ...rest`.
- Strip `onChange` and `onBlur` from props before passing to `useInput` (existing pattern, see number-input.tsx:51-58).
- Call `const { id, field, isRequired } = useInput(inputProps)`.
- Use `useResourceContext({ resource: resourceProp })` to compute the resource.
- Wrap render in `<FormField id={id} className={className} name={field.name}>` from `@/components/admin/form`.
- Render `<FormLabel><FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} /></FormLabel>` when `label !== false`.
- Render the actual input inside `<FormControl>` from `@/components/admin/form`.
- Render `<InputHelperText helperText={helperText} />` after the control.
- Render `<FormError />` last.
- Export a `<Name>InputProps` interface that extends `InputProps` (from ra-core) and the appropriate native input's `React.ComponentProps`.

### Tests use stories via `StoryAdmin`

Per `AGENTS.md`: tests import story exports rather than rebuilding wrappers. Stories use the shared `StoryAdmin` helper from `src/stories/_test-helpers.tsx`. Example:

```tsx
// src/stories/admin/rating-input.stories.tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { RatingInput } from "@/components/admin";

export default {
  title: "Data Edition/RatingInput",
};

export const Basic = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" />
  </StoryAdmin>
);

export const HalfStep = () => (
  <StoryAdmin mode="form" record={{ rating: 2.5 }}>
    <RatingInput source="rating" allowHalf />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" disabled />
  </StoryAdmin>
);
```

```tsx
// src/components/admin/rating-input.spec.tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  HalfStep,
} from "@/stories/admin/rating-input.stories";

describe("<RatingInput />", () => {
  it("renders five stars labelled by the source", async () => {
    const screen = render(<Basic />);
    const stars = screen.getByRole("radio");
    await expect.element(stars.first()).toBeInTheDocument();
  });
});
```

### Doc page template

Each doc page is a single Markdown file under `docs/src/content/docs/<kebab-name>.md` with this shape:

```markdown
---
title: "RatingInput"
---

One-line description.

## Usage

(code block)

## Props

| Prop     | Required | Type     | Default | Description |
| -------- | -------- | -------- | ------- | ----------- |
| `source` | Required | `string` | -       | Field name  |

## (prop)

Per-significant-prop section.
```

Keep the kebab-case filename and the `title` frontmatter consistent with the component export name; the doc-drift script checks this.

### Commit cadence

Commit after each task. Use Conventional Commits:

- `feat(rating-input): add component + story + spec`
- `docs(rating-input): add documentation page`
- `chore(index): export rating components`

A subagent may bundle the docs commit with the implementation commit if it ships in a single task.

---

## Component 1: Rating

Star rating display + input. Five tasks total. Each task ends with lint + typecheck + the matching spec passing, then a commit.

### Task 1.1: Story file for `<RatingField>`

**Files:**

- Create: `src/stories/admin/rating-field.stories.tsx`

- [ ] **Step 1** — create the story file:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { RatingField } from "@/components/admin";

export default {
  title: "Data Display/RatingField",
};

export const Basic = () => (
  <StoryAdmin record={{ rating: 3 }}>
    <RatingField source="rating" />
  </StoryAdmin>
);

export const Half = () => (
  <StoryAdmin record={{ rating: 2.5 }}>
    <RatingField source="rating" allowHalf />
  </StoryAdmin>
);

export const MaxTen = () => (
  <StoryAdmin record={{ rating: 7 }}>
    <RatingField source="rating" max={10} />
  </StoryAdmin>
);

export const WithCount = () => (
  <StoryAdmin record={{ rating: 4, ratingCount: 128 }}>
    <RatingField source="rating" countSource="ratingCount" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ rating: null }}>
    <RatingField source="rating" empty="—" />
  </StoryAdmin>
);
```

- [ ] **Step 2** — note: this file will not typecheck until Task 1.2 lands. Do not run typecheck between Task 1.1 and Task 1.2; bundle them in a single commit.

### Task 1.2: Implement `<RatingField>` + its spec

**Files:**

- Create: `src/components/admin/rating-field.tsx`
- Create: `src/components/admin/rating-field.spec.tsx`

- [ ] **Step 1** — write the spec first (TDD):

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  Half,
  MaxTen,
  WithCount,
} from "@/stories/admin/rating-field.stories";

describe("<RatingField />", () => {
  it("renders 5 stars with 3 filled by default", async () => {
    const screen = render(<Basic />);
    const stars = screen.container.querySelectorAll("[data-rating-star]");
    expect(stars.length).toBe(5);
    const filled = screen.container.querySelectorAll(
      "[data-rating-star='filled']",
    );
    expect(filled.length).toBe(3);
  });

  it("renders 7 stars filled out of 10 when max=10", async () => {
    const screen = render(<MaxTen />);
    const stars = screen.container.querySelectorAll("[data-rating-star]");
    expect(stars.length).toBe(10);
    expect(
      screen.container.querySelectorAll("[data-rating-star='filled']").length,
    ).toBe(7);
  });

  it("renders a half star when allowHalf and value=2.5", async () => {
    const screen = render(<Half />);
    expect(
      screen.container.querySelectorAll("[data-rating-star='half']").length,
    ).toBe(1);
    expect(
      screen.container.querySelectorAll("[data-rating-star='filled']").length,
    ).toBe(2);
  });

  it("renders the count when countSource is set", async () => {
    const screen = render(<WithCount />);
    await expect.element(screen.getByText("(128)")).toBeInTheDocument();
  });

  it("renders the empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run the spec to verify it fails (no `RatingField` export yet):

```bash
pnpm vitest run --browser.headless src/components/admin/rating-field.spec.tsx
```

Expected: FAIL with `Failed to resolve import "@/components/admin"` for `RatingField`, or `RatingField is not defined`.

- [ ] **Step 3** — implement the field:

```tsx
// src/components/admin/rating-field.tsx
import type { HTMLAttributes } from "react";
import {
  sanitizeFieldRestProps,
  useFieldValue,
  useRecordContext,
  useTranslate,
} from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays a numeric rating as a row of filled/half/outlined star icons.
 *
 * Use `<RatingField>` to render a product, review, or driver rating from a
 * numeric column. Supports half-star granularity, configurable `max`, and an
 * optional sibling count source.
 *
 * @example
 * <RatingField source="rating" allowHalf countSource="reviewCount" />
 */
export const RatingField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  max = 5,
  allowHalf = false,
  countSource,
  className,
  ...rest
}: RatingFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const ctxRecord = useRecordContext<RecordType>({ record });
  const translate = useTranslate();
  const count =
    countSource && ctxRecord
      ? (ctxRecord[countSource] as number | undefined)
      : undefined;

  if (value == null) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  const stars = renderStars(numericValue, max, allowHalf);

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={`inline-flex items-center gap-1 ${className ?? ""}`}
      aria-label={`${numericValue} out of ${max}`}
    >
      <span className="inline-flex">{stars}</span>
      {count != null && (
        <span className="text-muted-foreground text-sm">({count})</span>
      )}
    </span>
  );
};

function renderStars(value: number, max: number, allowHalf: boolean) {
  const out: React.ReactNode[] = [];
  for (let i = 1; i <= max; i++) {
    let kind: "filled" | "half" | "empty" = "empty";
    if (value >= i) kind = "filled";
    else if (allowHalf && value >= i - 0.5) kind = "half";
    out.push(<Star key={i} kind={kind} />);
  }
  return out;
}

const Star = ({ kind }: { kind: "filled" | "half" | "empty" }) => {
  const fill =
    kind === "filled"
      ? "currentColor"
      : kind === "half"
        ? "url(#rating-half)"
        : "none";
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      fill={fill}
      data-rating-star={kind}
      className="text-yellow-500"
      aria-hidden
    >
      <defs>
        <linearGradient id="rating-half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon points="12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9" />
    </svg>
  );
};

export interface RatingFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** Total stars rendered (filled + outlined). Default 5. */
  max?: number;
  /** Allow half-star granularity when value is between integers. */
  allowHalf?: boolean;
  /** Sibling record source rendered in parentheses (e.g. review count). */
  countSource?: string;
}
```

- [ ] **Step 4** — append the export to `src/components/admin/index.ts` (preserve alpha order):

```ts
// after "./radio-button-group-input" line
export * from "./rating-field";
```

- [ ] **Step 5** — run the spec again, all five tests must pass:

```bash
pnpm vitest run --browser.headless src/components/admin/rating-field.spec.tsx
```

Expected: PASS 5/5.

- [ ] **Step 6** — run lint + typecheck in parallel:

```bash
pnpm run lint && pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/rating-field.stories.tsx src/components/admin/rating-field.tsx src/components/admin/rating-field.spec.tsx src/components/admin/index.ts
git commit -m "feat(rating-field): add RatingField component + story + spec"
```

### Task 1.3: Story file for `<RatingInput>`

**Files:**

- Create: `src/stories/admin/rating-input.stories.tsx`

- [ ] **Step 1** — create the story file:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { RatingInput } from "@/components/admin";

export default {
  title: "Data Edition/RatingInput",
};

export const Basic = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" />
  </StoryAdmin>
);

export const HalfStep = () => (
  <StoryAdmin mode="form" record={{ rating: 2.5 }}>
    <RatingInput source="rating" allowHalf />
  </StoryAdmin>
);

export const Max10 = () => (
  <StoryAdmin mode="form" record={{ rating: 7 }}>
    <RatingInput source="rating" max={10} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" disabled />
  </StoryAdmin>
);

export const NoLabel = () => (
  <StoryAdmin mode="form" record={{ rating: 4 }}>
    <RatingInput source="rating" label={false} />
  </StoryAdmin>
);
```

### Task 1.4: Implement `<RatingInput>` + its spec

**Files:**

- Create: `src/components/admin/rating-input.tsx`
- Create: `src/components/admin/rating-input.spec.tsx`

- [ ] **Step 1** — write the spec first:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  HalfStep,
  Max10,
  NoLabel,
} from "@/stories/admin/rating-input.stories";

describe("<RatingInput />", () => {
  it("renders five radio inputs labelled by source", async () => {
    const screen = render(<Basic />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(5);
    await expect.element(screen.getByText(/^rating$/i)).toBeInTheDocument();
  });

  it("shows 10 stars when max=10", async () => {
    const screen = render(<Max10 />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(10);
  });

  it("renders half-step inputs when allowHalf", async () => {
    const screen = render(<HalfStep />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(10);
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const star = screen.container.querySelector("[role='radio']");
    expect(star?.getAttribute("aria-disabled")).toBe("true");
  });

  it("hides the label when label=false", async () => {
    const screen = render(<NoLabel />);
    await expect.element(screen.getByText(/^rating$/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run the spec to verify it fails:

```bash
pnpm vitest run --browser.headless src/components/admin/rating-input.spec.tsx
```

Expected: FAIL with `RatingInput` not exported.

- [ ] **Step 3** — implement the input:

```tsx
// src/components/admin/rating-input.tsx
import type * as React from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import { FormControl, FormField, FormLabel } from "@/components/admin/form";
import { FormError } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * N-star rating input with optional half-step granularity.
 *
 * Stores a `number` (0..max). Keyboard accessible via arrow keys (each star
 * is `role="radio"`, the group is `role="radiogroup"`).
 *
 * @example
 * <RatingInput source="rating" allowHalf max={5} />
 */
export const RatingInput = (props: RatingInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    max = 5,
    allowHalf = false,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { id, field, isRequired } = useInput(props);

  const steps = allowHalf ? max * 2 : max;
  const stepValue = allowHalf ? 0.5 : 1;
  const currentValue = (field.value as number | null | undefined) ?? 0;

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
          aria-disabled={disabled}
          className={cn("flex items-center gap-1", className)}
          {...rest}
        >
          {Array.from({ length: steps }).map((_, i) => {
            const v = (i + 1) * stepValue;
            const selected = currentValue >= v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => !disabled && field.onChange(v)}
                onBlur={field.onBlur}
                className={cn(
                  "p-0.5 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <Star filled={selected} half={allowHalf && v % 1 !== 0} />
              </button>
            );
          })}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

const Star = ({ filled, half }: { filled: boolean; half: boolean }) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    fill={filled ? "currentColor" : "none"}
    className="text-yellow-500"
    aria-hidden
  >
    <polygon
      points={
        half
          ? "12 2 12 17 6 22 8 14 2 9 9 9"
          : "12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9"
      }
    />
  </svg>
);

export interface RatingInputProps
  extends InputProps, Omit<React.ComponentProps<"div">, "defaultValue"> {
  max?: number;
  allowHalf?: boolean;
  disabled?: boolean;
}
```

- [ ] **Step 4** — append the export to `src/components/admin/index.ts`:

```ts
// after "./rating-field"
export * from "./rating-input";
```

- [ ] **Step 5** — run the spec, all five tests must pass:

```bash
pnpm vitest run --browser.headless src/components/admin/rating-input.spec.tsx
```

Expected: PASS 5/5.

- [ ] **Step 6** — run lint + typecheck.

- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/rating-input.stories.tsx src/components/admin/rating-input.tsx src/components/admin/rating-input.spec.tsx src/components/admin/index.ts
git commit -m "feat(rating-input): add RatingInput component + story + spec"
```

### Task 1.5: Doc pages for `<RatingField>` + `<RatingInput>`

**Files:**

- Create: `docs/src/content/docs/rating-field.md`
- Create: `docs/src/content/docs/rating-input.md`

- [ ] **Step 1** — write `rating-field.md`:

````markdown
---
title: "RatingField"
---

Displays a numeric rating as a row of filled / half / outlined star icons.

## Usage

```tsx
import { RatingField } from '@/components/admin';

<RatingField source="rating" />
<RatingField source="rating" max={10} allowHalf />
<RatingField source="rating" countSource="reviewCount" empty="No ratings yet" />
```

## Props

| Prop           | Required | Type         | Default | Description                                       |
| -------------- | -------- | ------------ | ------- | ------------------------------------------------- |
| `source`       | Required | `string`     | -       | Record field to read                              |
| `max`          | Optional | `number`     | `5`     | Total stars rendered                              |
| `allowHalf`    | Optional | `boolean`    | `false` | Render half-stars for fractional values           |
| `countSource`  | Optional | `string`     | -       | Sibling field rendered as `(N)` next to the stars |
| `empty`        | Optional | `ReactNode`  | -       | Fallback when value is `null`/`undefined`         |
| `className`    | Optional | `string`     | -       | CSS class on the wrapping `<span>`                |
| `defaultValue` | Optional | `number`     | -       | Default when no record value exists               |
| `record`       | Optional | `RecordType` | -       | Record to read instead of `useRecordContext()`    |

## `max`

Defaults to 5. Set to `10` for 10-star scales.

## `allowHalf`

When `true`, values like `3.5` render the third and fourth stars as one filled
star plus one half-filled star. When `false`, fractional values are rounded
toward zero.

## `countSource`

Reads a sibling field from the same record and renders it in parentheses to
the right of the stars.
````

- [ ] **Step 2** — write `rating-input.md`:

````markdown
---
title: "RatingInput"
---

Star rating input that stores a numeric value (0..`max`).

## Usage

```tsx
import { RatingInput } from '@/components/admin';

<RatingInput source="rating" />
<RatingInput source="rating" max={10} allowHalf />
<RatingInput source="rating" disabled />
```

## Props

| Prop           | Required | Type                       | Default  | Description                      |
| -------------- | -------- | -------------------------- | -------- | -------------------------------- |
| `source`       | Required | `string`                   | -        | Form field name                  |
| `max`          | Optional | `number`                   | `5`      | Total stars rendered             |
| `allowHalf`    | Optional | `boolean`                  | `false`  | Allow half-step selection        |
| `label`        | Optional | `string \| false`          | Inferred | Custom label, or `false` to hide |
| `helperText`   | Optional | `ReactNode`                | -        | Helper text below the input      |
| `disabled`     | Optional | `boolean`                  | `false`  | Disable input                    |
| `defaultValue` | Optional | `number`                   | -        | Initial value                    |
| `validate`     | Optional | `Validator \| Validator[]` | -        | Validation                       |
| `className`    | Optional | `string`                   | -        | CSS class on the radiogroup      |

## Keyboard

The component renders a `role="radiogroup"` with `role="radio"` children.
Standard arrow-key navigation applies; `Space` / `Enter` selects.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/rating-field.md docs/src/content/docs/rating-input.md
git commit -m "docs(rating): add RatingField + RatingInput documentation"
```

---

## Component 2: Color

Color picker input + chip display. Uses native `<input type="color">` for the picker (no dep).

### Task 2.1: Story file for `<ColorField>`

**Files:** Create `src/stories/admin/color-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { ColorField } from "@/components/admin";

export default { title: "Data Display/ColorField" };

export const Basic = () => (
  <StoryAdmin record={{ color: "#3b82f6" }}>
    <ColorField source="color" />
  </StoryAdmin>
);

export const Oklch = () => (
  <StoryAdmin record={{ color: "oklch(0.7 0.2 250)" }}>
    <ColorField source="color" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ color: null }}>
    <ColorField source="color" empty="No color" />
  </StoryAdmin>
);
```

### Task 2.2: Implement `<ColorField>` + its spec

**Files:** Create `src/components/admin/color-field.tsx`, `src/components/admin/color-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty, Oklch } from "@/stories/admin/color-field.stories";

describe("<ColorField />", () => {
  it("renders a chip whose background matches the hex value", async () => {
    const screen = render(<Basic />);
    const chip = screen.container.querySelector(
      "[data-color-chip]",
    ) as HTMLElement;
    expect(chip).toBeTruthy();
    expect(chip.style.backgroundColor).toBe("rgb(59, 130, 246)");
    await expect.element(screen.getByText("#3b82f6")).toBeInTheDocument();
  });

  it("renders an oklch value as label text", async () => {
    const screen = render(<Oklch />);
    await expect.element(screen.getByText(/oklch/i)).toBeInTheDocument();
  });

  it("renders empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No color")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL:

```bash
pnpm vitest run --browser.headless src/components/admin/color-field.spec.tsx
```

- [ ] **Step 3** — implement the field:

```tsx
// src/components/admin/color-field.tsx
import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays a color value as a colored chip plus its string label.
 *
 * Accepts any CSS color string (hex, rgb, oklch). The chip's background is
 * set via the inline `style` attribute so the browser parses the value.
 */
export const ColorField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  showLabel = true,
  className,
  ...rest
}: ColorFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null || value === "") {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const colorString = String(value);

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
    >
      <span
        data-color-chip
        className="inline-block h-4 w-4 rounded border border-border"
        style={{ backgroundColor: colorString }}
        aria-hidden
      />
      {showLabel && <span className="font-mono text-sm">{colorString}</span>}
    </span>
  );
};

export interface ColorFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** When false, hides the textual color value next to the chip. */
  showLabel?: boolean;
}
```

- [ ] **Step 4** — append export to `index.ts`:

```ts
export * from "./color-field";
```

- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/color-field.stories.tsx src/components/admin/color-field.tsx src/components/admin/color-field.spec.tsx src/components/admin/index.ts
git commit -m "feat(color-field): add ColorField component + story + spec"
```

### Task 2.3: Story file for `<ColorInput>`

**Files:** Create `src/stories/admin/color-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { ColorInput } from "@/components/admin";

export default { title: "Data Edition/ColorInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput source="color" />
  </StoryAdmin>
);

export const WithSwatches = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput
      source="color"
      swatches={[
        "#ef4444",
        "#f97316",
        "#eab308",
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
      ]}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput source="color" disabled />
  </StoryAdmin>
);
```

### Task 2.4: Implement `<ColorInput>` + its spec

**Files:** Create `src/components/admin/color-input.tsx`, `src/components/admin/color-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  WithSwatches,
} from "@/stories/admin/color-input.stories";

describe("<ColorInput />", () => {
  it("renders a color input bound to source", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='color']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("#3b82f6");
    await expect.element(screen.getByText(/^color$/i)).toBeInTheDocument();
  });

  it("renders swatch buttons when swatches prop is set", async () => {
    const screen = render(<WithSwatches />);
    const swatches = screen.container.querySelectorAll("[data-color-swatch]");
    expect(swatches.length).toBe(6);
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const input = screen.container.querySelector(
      "input[type='color']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/color-input.tsx
import type * as React from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Color picker input. Stores a CSS color string (hex by default).
 */
export const ColorInput = (props: ColorInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    swatches,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

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
        <div className="flex items-center gap-2">
          <Input
            {...rest}
            type="color"
            value={(field.value as string | undefined) ?? "#000000"}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            disabled={disabled}
            className="h-9 w-12 cursor-pointer p-1"
          />
          {swatches?.map((s) => (
            <button
              key={s}
              type="button"
              data-color-swatch
              aria-label={`Select color ${s}`}
              disabled={disabled}
              onClick={() => !disabled && field.onChange(s)}
              className={cn(
                "h-6 w-6 rounded border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "cursor-not-allowed opacity-50",
              )}
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface ColorInputProps
  extends
    InputProps,
    Omit<
      React.ComponentProps<"input">,
      "defaultValue" | "onBlur" | "onChange" | "type"
    > {
  swatches?: readonly string[];
}
```

- [ ] **Step 4** — append export: `export * from "./color-input";`
- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/color-input.stories.tsx src/components/admin/color-input.tsx src/components/admin/color-input.spec.tsx src/components/admin/index.ts
git commit -m "feat(color-input): add ColorInput component + story + spec"
```

### Task 2.5: Doc pages for `<ColorField>` + `<ColorInput>`

**Files:** Create `docs/src/content/docs/color-field.md`, `docs/src/content/docs/color-input.md`

- [ ] **Step 1** — write `color-field.md`:

````markdown
---
title: "ColorField"
---

Displays a CSS color value as a colored chip plus its string label.

## Usage

```tsx
import { ColorField } from '@/components/admin';

<ColorField source="color" />
<ColorField source="color" showLabel={false} />
<ColorField source="color" empty="No color set" />
```

## Props

| Prop        | Required | Type        | Default | Description                            |
| ----------- | -------- | ----------- | ------- | -------------------------------------- |
| `source`    | Required | `string`    | -       | Record field to read                   |
| `showLabel` | Optional | `boolean`   | `true`  | Show the color string next to the chip |
| `empty`     | Optional | `ReactNode` | -       | Fallback when value is `null`/empty    |
| `className` | Optional | `string`    | -       | CSS class on the wrapping `<span>`     |

## Accepted formats

Any CSS color string the browser can parse: `#3b82f6`, `rgb(59 130 246)`,
`oklch(0.7 0.2 250)`, `hsl(217 91% 60%)`, named colors like `tomato`.
````

- [ ] **Step 2** — write `color-input.md`:

````markdown
---
title: "ColorInput"
---

Color picker input backed by the native `<input type="color">` element.
Stores a hex color string. Supports optional preset swatches.

## Usage

```tsx
import { ColorInput } from '@/components/admin';

<ColorInput source="color" />
<ColorInput source="color" swatches={["#ef4444", "#3b82f6", "#10b981"]} />
<ColorInput source="color" disabled />
```

## Props

| Prop           | Required | Type                       | Default  | Description                             |
| -------------- | -------- | -------------------------- | -------- | --------------------------------------- |
| `source`       | Required | `string`                   | -        | Form field name                         |
| `swatches`     | Optional | `readonly string[]`        | -        | Preset hex strings rendered as buttons  |
| `label`        | Optional | `string \| false`          | Inferred | Custom label, or `false` to hide        |
| `helperText`   | Optional | `ReactNode`                | -        | Helper text below the input             |
| `disabled`     | Optional | `boolean`                  | `false`  | Disable input + swatches                |
| `defaultValue` | Optional | `string`                   | -        | Initial color value                     |
| `validate`     | Optional | `Validator \| Validator[]` | -        | Validation                              |
| `className`    | Optional | `string`                   | -        | CSS class on the wrapping `<FormField>` |

## Storage format

The native `<input type="color">` element only emits 6-digit lowercase hex
(e.g. `#3b82f6`).
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/color-field.md docs/src/content/docs/color-input.md
git commit -m "docs(color): add ColorField + ColorInput documentation"
```

---

## Component 3: Currency

Locale-aware money display + input. Stores `{ amount: number, currency: string }` or major-unit `number`. Uses `Intl.NumberFormat` (built-in).

### Task 3.1: Story file for `<CurrencyField>`

**Files:** Create `src/stories/admin/currency-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { CurrencyField } from "@/components/admin";

export default { title: "Data Display/CurrencyField" };

export const Basic = () => (
  <StoryAdmin record={{ price: 1234.5 }}>
    <CurrencyField source="price" currency="USD" />
  </StoryAdmin>
);

export const Eur = () => (
  <StoryAdmin record={{ price: 999.99 }}>
    <CurrencyField source="price" currency="EUR" displayLocale="de-DE" />
  </StoryAdmin>
);

export const MinorUnits = () => (
  <StoryAdmin record={{ price: 12345 }}>
    <CurrencyField source="price" currency="USD" storeAsMinorUnits />
  </StoryAdmin>
);

export const Composite = () => (
  <StoryAdmin record={{ price: { amount: 1234.5, currency: "JPY" } }}>
    <CurrencyField source="price" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ price: null }}>
    <CurrencyField source="price" currency="USD" empty="—" />
  </StoryAdmin>
);
```

### Task 3.2: Implement `<CurrencyField>` + its spec

**Files:** Create `src/components/admin/currency-field.tsx`, `src/components/admin/currency-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Composite,
  Empty,
  Eur,
  MinorUnits,
} from "@/stories/admin/currency-field.stories";

describe("<CurrencyField />", () => {
  it("formats a number with USD by default", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("$1,234.50")).toBeInTheDocument();
  });

  it("formats with EUR + de-DE locale", async () => {
    const screen = render(<Eur />);
    await expect.element(screen.getByText(/999,99/)).toBeInTheDocument();
  });

  it("divides by 100 when storeAsMinorUnits=true", async () => {
    const screen = render(<MinorUnits />);
    await expect.element(screen.getByText("$123.45")).toBeInTheDocument();
  });

  it("reads currency from the composite object shape", async () => {
    const screen = render(<Composite />);
    await expect.element(screen.getByText(/¥/)).toBeInTheDocument();
  });

  it("renders empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/currency-field.tsx
import type { HTMLAttributes } from "react";
import {
  sanitizeFieldRestProps,
  useFieldValue,
  useLocaleState,
  useTranslate,
} from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays a monetary value using `Intl.NumberFormat`.
 *
 * Accepts either a plain `number` (with `currency` prop) or a composite
 * `{ amount: number, currency: string }` object. When `storeAsMinorUnits` is
 * true, the numeric value is divided by 100 before formatting (cents → dollars).
 */
export const CurrencyField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  empty,
  currency,
  displayLocale,
  storeAsMinorUnits = false,
  options,
  className,
  ...rest
}: CurrencyFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const [appLocale] = useLocaleState();
  const translate = useTranslate();
  const locale = displayLocale ?? appLocale;

  if (value == null) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const { amount, code } = normalizeCurrencyValue(value, currency);
  const major = storeAsMinorUnits ? amount / 100 : amount;
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    ...options,
  }).format(major);

  return (
    <span {...sanitizeFieldRestProps(rest)} className={className}>
      {formatted}
    </span>
  );
};

function normalizeCurrencyValue(
  v: unknown,
  fallbackCurrency?: string,
): { amount: number; code: string } {
  if (typeof v === "object" && v !== null && "amount" in v && "currency" in v) {
    const obj = v as { amount: number; currency: string };
    return { amount: obj.amount, code: obj.currency };
  }
  if (!fallbackCurrency) {
    throw new Error(
      "<CurrencyField>: numeric value requires a `currency` prop",
    );
  }
  return { amount: Number(v), code: fallbackCurrency };
}

export interface CurrencyFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** ISO-4217 currency code (e.g. 'USD'). Required when value is a plain number. */
  currency?: string;
  /** Override the user's app locale. */
  displayLocale?: string;
  /** Treat the stored value as minor units (cents) and divide by 100. */
  storeAsMinorUnits?: boolean;
  /** Extra options forwarded to `Intl.NumberFormat`. */
  options?: Intl.NumberFormatOptions;
}
```

- [ ] **Step 4** — append export: `export * from "./currency-field";`
- [ ] **Step 5** — run spec, expect PASS 5/5.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/currency-field.stories.tsx src/components/admin/currency-field.tsx src/components/admin/currency-field.spec.tsx src/components/admin/index.ts
git commit -m "feat(currency-field): add CurrencyField component + story + spec"
```

### Task 3.3: Story file for `<CurrencyInput>`

**Files:** Create `src/stories/admin/currency-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { CurrencyInput } from "@/components/admin";

export default { title: "Data Edition/CurrencyInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ price: 1234.5 }}>
    <CurrencyInput source="price" currency="USD" />
  </StoryAdmin>
);

export const AllowCurrencyChange = () => (
  <StoryAdmin
    mode="form"
    record={{ price: { amount: 1234.5, currency: "EUR" } }}
  >
    <CurrencyInput source="price" currencies={["USD", "EUR", "JPY", "GBP"]} />
  </StoryAdmin>
);

export const MinorUnits = () => (
  <StoryAdmin mode="form" record={{ price: 12345 }}>
    <CurrencyInput source="price" currency="USD" storeAsMinorUnits />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ price: 1234.5 }}>
    <CurrencyInput source="price" currency="USD" disabled />
  </StoryAdmin>
);
```

### Task 3.4: Implement `<CurrencyInput>` + its spec

**Files:** Create `src/components/admin/currency-input.tsx`, `src/components/admin/currency-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  AllowCurrencyChange,
  Basic,
  Disabled,
  MinorUnits,
} from "@/stories/admin/currency-input.stories";

describe("<CurrencyInput />", () => {
  it("renders a number input with the USD symbol", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='number']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("1234.5");
    await expect.element(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders a currency selector when currencies array is set", async () => {
    const screen = render(<AllowCurrencyChange />);
    const select = screen.container.querySelector(
      "select[data-currency-select]",
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("EUR");
  });

  it("displays a divided major value when storeAsMinorUnits=true", async () => {
    const screen = render(<MinorUnits />);
    const input = screen.container.querySelector(
      "input[type='number']",
    ) as HTMLInputElement;
    expect(input.value).toBe("123.45");
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const input = screen.container.querySelector(
      "input[type='number']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/currency-input.tsx
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { InputProps } from "ra-core";
import {
  FieldTitle,
  useInput,
  useLocaleState,
  useResourceContext,
} from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Locale-aware money input.
 *
 * Stores either a plain `number` (single-currency mode) or a composite
 * `{ amount: number, currency: string }` (multi-currency mode).
 */
export const CurrencyInput = (props: CurrencyInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    currency,
    currencies,
    displayLocale,
    storeAsMinorUnits = false,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const [appLocale] = useLocaleState();
  const locale = displayLocale ?? appLocale;

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const isComposite = !!currencies;
  const composite = isComposite
    ? (field.value as { amount: number; currency: string } | null)
    : null;
  const fixedAmount = isComposite
    ? composite?.amount
    : (field.value as number | null);
  const currentCurrency = isComposite ? composite?.currency : currency;

  const majorAmount =
    fixedAmount != null
      ? storeAsMinorUnits
        ? fixedAmount / 100
        : fixedAmount
      : "";

  const [displayValue, setDisplayValue] = useState<string>(String(majorAmount));
  const hasFocus = useRef(false);

  useEffect(() => {
    if (!hasFocus.current) setDisplayValue(String(majorAmount));
  }, [majorAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    const parsed = e.target.valueAsNumber;
    const next = Number.isNaN(parsed)
      ? null
      : storeAsMinorUnits
        ? Math.round(parsed * 100)
        : parsed;
    if (isComposite) {
      field.onChange({
        amount: next ?? 0,
        currency: currentCurrency ?? currencies![0],
      });
    } else {
      field.onChange(next);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isComposite) return;
    field.onChange({
      amount: composite?.amount ?? 0,
      currency: e.target.value,
    });
  };

  const currencySymbol = currentCurrency
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currentCurrency,
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value
    : "";

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
        <div className={cn("flex items-center gap-2", className)}>
          <span className="text-muted-foreground text-sm w-6 text-right">
            {currencySymbol}
          </span>
          <Input
            {...rest}
            type="number"
            value={displayValue}
            step={storeAsMinorUnits ? 0.01 : "any"}
            onChange={handleAmountChange}
            onFocus={() => (hasFocus.current = true)}
            onBlur={() => {
              hasFocus.current = false;
              field.onBlur();
            }}
            disabled={disabled}
          />
          {isComposite && (
            <select
              data-currency-select
              value={currentCurrency ?? currencies![0]}
              onChange={handleCurrencyChange}
              disabled={disabled}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {currencies!.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface CurrencyInputProps
  extends
    InputProps,
    Omit<
      React.ComponentProps<"input">,
      "defaultValue" | "onBlur" | "onChange" | "type" | "step"
    > {
  /** ISO-4217 currency code when storage is a plain number. */
  currency?: string;
  /** Provide to enable currency selection; stores composite { amount, currency }. */
  currencies?: readonly string[];
  /** Override the user's app locale for formatting symbol/step. */
  displayLocale?: string;
  /** Multiply displayed major units by 100 on write so storage is integer cents. */
  storeAsMinorUnits?: boolean;
}
```

- [ ] **Step 4** — append export: `export * from "./currency-input";`
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/currency-input.stories.tsx src/components/admin/currency-input.tsx src/components/admin/currency-input.spec.tsx src/components/admin/index.ts
git commit -m "feat(currency-input): add CurrencyInput component + story + spec"
```

### Task 3.5: Doc pages for `<CurrencyField>` + `<CurrencyInput>`

**Files:** Create `docs/src/content/docs/currency-field.md`, `docs/src/content/docs/currency-input.md`

- [ ] **Step 1** — write `currency-field.md`:

````markdown
---
title: "CurrencyField"
---

Displays a monetary value using `Intl.NumberFormat`.

## Usage

```tsx
import { CurrencyField } from '@/components/admin';

<CurrencyField source="price" currency="USD" />
<CurrencyField source="price" currency="EUR" displayLocale="de-DE" />
<CurrencyField source="price" currency="USD" storeAsMinorUnits />
```

## Props

| Prop                | Required   | Type                       | Default    | Description                                       |
| ------------------- | ---------- | -------------------------- | ---------- | ------------------------------------------------- |
| `source`            | Required   | `string`                   | -          | Record field to read                              |
| `currency`          | Optional\* | `string`                   | -          | ISO-4217 code (required for plain-number storage) |
| `displayLocale`     | Optional   | `string`                   | App locale | Override formatting locale                        |
| `storeAsMinorUnits` | Optional   | `boolean`                  | `false`    | Divide by 100 before formatting                   |
| `options`           | Optional   | `Intl.NumberFormatOptions` | -          | Extra `Intl.NumberFormat` options                 |
| `empty`             | Optional   | `ReactNode`                | -          | Fallback when value is `null`                     |
| `className`         | Optional   | `string`                   | -          | CSS class on `<span>`                             |

\* `currency` is required when the source holds a plain number; not required when the source holds `{ amount, currency }`.

## Storage shapes

Either a plain number (`{ price: 1234.5 }` with `currency` prop), a composite
object (`{ price: { amount, currency } }`), or integer minor units (`{ price:
123450 }` with `storeAsMinorUnits`).
````

- [ ] **Step 2** — write `currency-input.md`:

````markdown
---
title: "CurrencyInput"
---

Locale-aware money input. Stores a `number` (single-currency) or a composite
`{ amount, currency }` object (multi-currency).

## Usage

```tsx
import { CurrencyInput } from '@/components/admin';

<CurrencyInput source="price" currency="USD" />
<CurrencyInput source="price" currencies={["USD", "EUR", "JPY"]} />
<CurrencyInput source="price" currency="USD" storeAsMinorUnits />
```

## Props

| Prop                | Required | Type                             | Default    | Description                                |
| ------------------- | -------- | -------------------------------- | ---------- | ------------------------------------------ |
| `source`            | Required | `string`                         | -          | Form field name                            |
| `currency`          | Optional | `string`                         | -          | ISO-4217 code (single-currency mode)       |
| `currencies`        | Optional | `readonly string[]`              | -          | Enable currency selector; stores composite |
| `displayLocale`     | Optional | `string`                         | App locale | Override locale for symbol/step            |
| `storeAsMinorUnits` | Optional | `boolean`                        | `false`    | Store integer cents                        |
| `label`             | Optional | `string \| false`                | Inferred   | Custom label, `false` to hide              |
| `helperText`        | Optional | `ReactNode`                      | -          | Helper text                                |
| `disabled`          | Optional | `boolean`                        | `false`    | Disable input + currency selector          |
| `defaultValue`      | Optional | `number \| { amount, currency }` | -          | Initial value                              |
| `validate`          | Optional | `Validator \| Validator[]`       | -          | Validation                                 |
| `className`         | Optional | `string`                         | -          | CSS class on the row                       |

## Single- vs multi-currency

Pass `currency` for single-currency apps; the value is a plain number. Pass
`currencies` to render a select beside the amount; the value is composite.
Don't pass both — `currencies` takes precedence.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/currency-field.md docs/src/content/docs/currency-input.md
git commit -m "docs(currency): add CurrencyField + CurrencyInput documentation"
```

---

## Component 4: Duration

ISO-8601 duration display + input. Storage format is `PT2H30M` strings. Parsing via regex; display uses `date-fns/formatDuration` (already transitive).

### Task 4.1: Story file for `<DurationField>`

**Files:** Create `src/stories/admin/duration-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { DurationField } from "@/components/admin";

export default { title: "Data Display/DurationField" };

export const Basic = () => (
  <StoryAdmin record={{ duration: "PT2H30M" }}>
    <DurationField source="duration" />
  </StoryAdmin>
);

export const DaysHours = () => (
  <StoryAdmin record={{ duration: "P1DT4H" }}>
    <DurationField source="duration" />
  </StoryAdmin>
);

export const Relative = () => (
  <StoryAdmin record={{ duration: "PT45M" }}>
    <DurationField source="duration" displayFormat="relative" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ duration: null }}>
    <DurationField source="duration" empty="—" />
  </StoryAdmin>
);
```

### Task 4.2: Implement `<DurationField>` + its spec

**Files:** Create `src/components/admin/duration-field.tsx`, `src/components/admin/duration-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DaysHours,
  Empty,
  Relative,
} from "@/stories/admin/duration-field.stories";

describe("<DurationField />", () => {
  it("renders '2h 30m' for PT2H30M", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("2h 30m")).toBeInTheDocument();
  });

  it("renders '1d 4h' for P1DT4H", async () => {
    const screen = render(<DaysHours />);
    await expect.element(screen.getByText("1d 4h")).toBeInTheDocument();
  });

  it("renders a relative phrase when displayFormat='relative'", async () => {
    const screen = render(<Relative />);
    await expect.element(screen.getByText(/45 minutes/i)).toBeInTheDocument();
  });

  it("renders empty fallback for null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/duration-field.tsx
import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { formatDuration } from "date-fns";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays an ISO-8601 duration string as a compact ("2h 30m") or relative
 * ("2 hours 30 minutes") human-readable value.
 */
export const DurationField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  empty,
  displayFormat = "compact",
  className,
  ...rest
}: DurationFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null || value === "") {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const parsed = parseIsoDuration(String(value));
  if (!parsed) return null;

  const text =
    displayFormat === "relative"
      ? formatDuration(parsed)
      : compactFormat(parsed);

  return (
    <span {...sanitizeFieldRestProps(rest)} className={className}>
      {text}
    </span>
  );
};

const ISO_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

export function parseIsoDuration(s: string): null | {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
} {
  const m = s.match(ISO_RE);
  if (!m) return null;
  const [, d, h, mn, sc] = m;
  const out: Record<string, number> = {};
  if (d) out.days = +d;
  if (h) out.hours = +h;
  if (mn) out.minutes = +mn;
  if (sc) out.seconds = +sc;
  return out as never;
}

function compactFormat(p: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): string {
  const parts: string[] = [];
  if (p.days) parts.push(`${p.days}d`);
  if (p.hours) parts.push(`${p.hours}h`);
  if (p.minutes) parts.push(`${p.minutes}m`);
  if (p.seconds) parts.push(`${p.seconds}s`);
  return parts.join(" ") || "0m";
}

export interface DurationFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  /** 'compact' renders `2h 30m`; 'relative' renders `2 hours 30 minutes`. */
  displayFormat?: "compact" | "relative";
}
```

- [ ] **Step 4** — append export: `export * from "./duration-field";`
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/duration-field.stories.tsx src/components/admin/duration-field.tsx src/components/admin/duration-field.spec.tsx src/components/admin/index.ts
git commit -m "feat(duration-field): add DurationField component + story + spec"
```

### Task 4.3: Story file for `<DurationInput>`

**Files:** Create `src/stories/admin/duration-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { DurationInput } from "@/components/admin";

export default { title: "Data Edition/DurationInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ duration: "PT2H30M" }}>
    <DurationInput source="duration" />
  </StoryAdmin>
);

export const HoursMinutesOnly = () => (
  <StoryAdmin mode="form" record={{ duration: "PT45M" }}>
    <DurationInput source="duration" units={["h", "m"]} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ duration: "PT2H30M" }}>
    <DurationInput source="duration" disabled />
  </StoryAdmin>
);
```

### Task 4.4: Implement `<DurationInput>` + its spec

**Files:** Create `src/components/admin/duration-input.tsx`, `src/components/admin/duration-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  HoursMinutesOnly,
} from "@/stories/admin/duration-input.stories";

describe("<DurationInput />", () => {
  it("renders separate inputs for each unit (default d/h/m/s)", async () => {
    const screen = render(<Basic />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    expect(inputs.length).toBe(4);
  });

  it("only renders h/m inputs when units=['h','m']", async () => {
    const screen = render(<HoursMinutesOnly />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    expect(inputs.length).toBe(2);
    const m = (inputs[1] as HTMLInputElement).value;
    expect(m).toBe("45");
  });

  it("disables all unit inputs when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    Array.from(inputs).forEach((i) =>
      expect((i as HTMLInputElement).disabled).toBe(true),
    );
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/duration-input.tsx
import type * as React from "react";
import { useEffect, useState } from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { parseIsoDuration } from "./duration-field";
import { cn } from "@/lib/utils";

type Unit = "d" | "h" | "m" | "s";
const UNIT_LABEL: Record<Unit, string> = {
  d: "days",
  h: "hours",
  m: "minutes",
  s: "seconds",
};

/**
 * Edits an ISO-8601 duration string via per-unit numeric inputs.
 */
export const DurationInput = (props: DurationInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    units = ["d", "h", "m", "s"] as Unit[],
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const parsed = parseIsoDuration(String(field.value ?? "")) ?? {};
  const [values, setValues] = useState<Record<Unit, string>>({
    d: parsed.days?.toString() ?? "",
    h: parsed.hours?.toString() ?? "",
    m: parsed.minutes?.toString() ?? "",
    s: parsed.seconds?.toString() ?? "",
  });

  useEffect(() => {
    const p = parseIsoDuration(String(field.value ?? "")) ?? {};
    setValues({
      d: p.days?.toString() ?? "",
      h: p.hours?.toString() ?? "",
      m: p.minutes?.toString() ?? "",
      s: p.seconds?.toString() ?? "",
    });
  }, [field.value]);

  const writeBack = (next: Record<Unit, string>) => {
    const dayPart = next.d ? `${+next.d}D` : "";
    const timeParts =
      (next.h ? `${+next.h}H` : "") +
      (next.m ? `${+next.m}M` : "") +
      (next.s ? `${+next.s}S` : "");
    const out =
      dayPart || timeParts
        ? `P${dayPart}${timeParts ? `T${timeParts}` : ""}`
        : "";
    field.onChange(out || null);
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
        <div className={cn("flex items-end gap-2", className)} {...rest}>
          {units.map((u) => (
            <label
              key={u}
              className="flex flex-col items-center text-xs text-muted-foreground"
            >
              <Input
                type="number"
                min={0}
                disabled={disabled}
                value={values[u]}
                onChange={(e) => {
                  const next = { ...values, [u]: e.target.value };
                  setValues(next);
                  writeBack(next);
                }}
                onBlur={field.onBlur}
                className="w-16"
                aria-label={UNIT_LABEL[u]}
              />
              <span>{UNIT_LABEL[u]}</span>
            </label>
          ))}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface DurationInputProps
  extends
    InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  /** Which units to expose. Default `["d","h","m","s"]`. */
  units?: readonly Unit[];
  disabled?: boolean;
}
```

- [ ] **Step 4** — append export: `export * from "./duration-input";`
- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/duration-input.stories.tsx src/components/admin/duration-input.tsx src/components/admin/duration-input.spec.tsx src/components/admin/index.ts
git commit -m "feat(duration-input): add DurationInput component + story + spec"
```

### Task 4.5: Doc pages for `<DurationField>` + `<DurationInput>`

**Files:** Create `docs/src/content/docs/duration-field.md`, `docs/src/content/docs/duration-input.md`

- [ ] **Step 1** — write `duration-field.md`:

````markdown
---
title: "DurationField"
---

Displays an ISO-8601 duration string (`PT2H30M`) as `2h 30m` or `2 hours 30 minutes`.

## Usage

```tsx
import { DurationField } from '@/components/admin';

<DurationField source="duration" />
<DurationField source="duration" displayFormat="relative" />
<DurationField source="duration" empty="—" />
```

## Props

| Prop            | Required | Type                      | Default     | Description                   |
| --------------- | -------- | ------------------------- | ----------- | ----------------------------- |
| `source`        | Required | `string`                  | -           | Record field to read          |
| `displayFormat` | Optional | `"compact" \| "relative"` | `"compact"` | Render style                  |
| `empty`         | Optional | `ReactNode`               | -           | Fallback when value is `null` |
| `className`     | Optional | `string`                  | -           | CSS class on `<span>`         |

## Storage format

ISO-8601 duration strings: `PT2H30M` (2 hours 30 minutes), `P1DT4H` (1 day 4
hours), `PT45M` (45 minutes). Unparseable strings render nothing.
````

- [ ] **Step 2** — write `duration-input.md`:

````markdown
---
title: "DurationInput"
---

Edits an ISO-8601 duration string via per-unit numeric inputs.

## Usage

```tsx
import { DurationInput } from '@/components/admin';

<DurationInput source="duration" />
<DurationInput source="duration" units={["h", "m"]} />
<DurationInput source="duration" disabled />
```

## Props

| Prop           | Required | Type                       | Default             | Description                   |
| -------------- | -------- | -------------------------- | ------------------- | ----------------------------- |
| `source`       | Required | `string`                   | -                   | Form field name               |
| `units`        | Optional | `("d"\|"h"\|"m"\|"s")[]`   | `["d","h","m","s"]` | Which units to expose         |
| `label`        | Optional | `string \| false`          | Inferred            | Custom label                  |
| `helperText`   | Optional | `ReactNode`                | -                   | Helper text                   |
| `disabled`     | Optional | `boolean`                  | `false`             | Disable all unit inputs       |
| `defaultValue` | Optional | `string`                   | -                   | Initial ISO duration          |
| `validate`     | Optional | `Validator \| Validator[]` | -                   | Validation                    |
| `className`    | Optional | `string`                   | -                   | CSS class on wrapping `<div>` |

## Storage format

ISO-8601 duration strings. An empty input writes `null`.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/duration-field.md docs/src/content/docs/duration-input.md
git commit -m "docs(duration): add DurationField + DurationInput documentation"
```

---

## Component 5: Phone

E.164 phone display + input with country selector. Requires `libphonenumber-js` dep.

### Task 5.1: Install `libphonenumber-js`

**Files:** Modify `package.json`

- [ ] **Step 1** — install:

```bash
pnpm add libphonenumber-js
```

- [ ] **Step 2** — verify install:

```bash
pnpm ls libphonenumber-js
```

Expected: shows installed version.

- [ ] **Step 3** — commit:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add libphonenumber-js for PhoneInput/PhoneField"
```

### Task 5.2: Story file for `<PhoneField>`

**Files:** Create `src/stories/admin/phone-field.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { PhoneField } from "@/components/admin";

export default { title: "Data Display/PhoneField" };

export const Basic = () => (
  <StoryAdmin record={{ phone: "+14155552671" }}>
    <PhoneField source="phone" />
  </StoryAdmin>
);

export const International = () => (
  <StoryAdmin record={{ phone: "+442071234567" }}>
    <PhoneField source="phone" displayFormat="international" />
  </StoryAdmin>
);

export const NoLink = () => (
  <StoryAdmin record={{ phone: "+14155552671" }}>
    <PhoneField source="phone" link={false} />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ phone: null }}>
    <PhoneField source="phone" empty="—" />
  </StoryAdmin>
);
```

### Task 5.3: Implement `<PhoneField>` + its spec

**Files:** Create `src/components/admin/phone-field.tsx`, `src/components/admin/phone-field.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  International,
  NoLink,
} from "@/stories/admin/phone-field.stories";

describe("<PhoneField />", () => {
  it("renders a tel: link with national format for a US number", async () => {
    const screen = render(<Basic />);
    const link = screen.container.querySelector("a") as HTMLAnchorElement;
    expect(link.href).toBe("tel:+14155552671");
    await expect.element(screen.getByText(/415.*5552671/)).toBeInTheDocument();
  });

  it("renders international format when displayFormat='international'", async () => {
    const screen = render(<International />);
    await expect
      .element(screen.getByText(/\+44 20 7123 4567/))
      .toBeInTheDocument();
  });

  it("renders a plain <span> when link=false", async () => {
    const screen = render(<NoLink />);
    expect(screen.container.querySelector("a")).toBeNull();
  });

  it("renders empty fallback for null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/phone-field.tsx
import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { parsePhoneNumber } from "libphonenumber-js";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays an E.164 phone number as a formatted label, optionally wrapped in
 * a `tel:` link.
 */
export const PhoneField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  displayFormat = "national",
  link = true,
  className,
  ...rest
}: PhoneFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null || value === "") {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  let formatted = String(value);
  let href = `tel:${value}`;
  try {
    const parsed = parsePhoneNumber(String(value));
    formatted =
      displayFormat === "international"
        ? parsed.formatInternational()
        : parsed.formatNational();
    href = parsed.getURI();
  } catch {
    // fall through: render raw
  }

  if (!link) {
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {formatted}
      </span>
    );
  }

  return (
    <a {...sanitizeFieldRestProps(rest)} href={href} className={className}>
      {formatted}
    </a>
  );
};

export interface PhoneFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends
    FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  /** 'national' renders `(415) 555-2671`; 'international' renders `+1 415 555 2671`. */
  displayFormat?: "national" | "international";
  /** When false, renders a plain `<span>` instead of a `tel:` link. */
  link?: boolean;
}
```

- [ ] **Step 4** — append export: `export * from "./phone-field";`
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/phone-field.stories.tsx src/components/admin/phone-field.tsx src/components/admin/phone-field.spec.tsx src/components/admin/index.ts
git commit -m "feat(phone-field): add PhoneField component + story + spec"
```

### Task 5.4: Story file for `<PhoneInput>`

**Files:** Create `src/stories/admin/phone-input.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { PhoneInput } from "@/components/admin";

export default { title: "Data Edition/PhoneInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" />
  </StoryAdmin>
);

export const DefaultCountryUS = () => (
  <StoryAdmin mode="form" record={{ phone: "" }}>
    <PhoneInput source="phone" defaultCountry="US" />
  </StoryAdmin>
);

export const RestrictedCountries = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" allowedCountries={["US", "CA", "MX"]} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" disabled />
  </StoryAdmin>
);
```

### Task 5.5: Implement `<PhoneInput>` + its spec

**Files:** Create `src/components/admin/phone-input.tsx`, `src/components/admin/phone-input.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DefaultCountryUS,
  Disabled,
  RestrictedCountries,
} from "@/stories/admin/phone-input.stories";

describe("<PhoneInput />", () => {
  it("renders a tel input with the value formatted for the country", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value.replace(/\D/g, "")).toContain("4155552671");
  });

  it("renders a country selector with all countries by default", async () => {
    const screen = render(<DefaultCountryUS />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("US");
  });

  it("limits country options when allowedCountries is set", async () => {
    const screen = render(<RestrictedCountries />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it("disables both country and number inputs when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    const input = screen.container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    expect(select.disabled).toBe(true);
    expect(input.disabled).toBe(true);
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/admin/phone-input.tsx
import type * as React from "react";
import { useEffect, useState } from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Phone input that stores E.164 (`+14155552671`) and renders a country
 * selector plus a national-format text input.
 */
export const PhoneInput = (props: PhoneInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    defaultCountry = "US",
    allowedCountries,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const countries = allowedCountries ?? (getCountries() as CountryCode[]);

  const initial = inferCountry(String(field.value ?? ""), defaultCountry);
  const [country, setCountry] = useState<CountryCode>(initial);
  const [display, setDisplay] = useState<string>(
    formatNational(String(field.value ?? ""), country),
  );

  useEffect(() => {
    const c = inferCountry(String(field.value ?? ""), defaultCountry);
    setCountry(c);
    setDisplay(formatNational(String(field.value ?? ""), c));
  }, [field.value, defaultCountry]);

  const writeBack = (nationalText: string, cc: CountryCode) => {
    setDisplay(nationalText);
    try {
      const parsed = parsePhoneNumber(nationalText, cc);
      field.onChange(parsed.number);
    } catch {
      field.onChange(nationalText);
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
        <div className={cn("flex items-center gap-2", className)} {...rest}>
          <select
            data-country-select
            value={country}
            onChange={(e) => {
              const cc = e.target.value as CountryCode;
              setCountry(cc);
              writeBack(display, cc);
            }}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c} +{getCountryCallingCode(c)}
              </option>
            ))}
          </select>
          <Input
            type="tel"
            value={display}
            disabled={disabled}
            onChange={(e) => {
              const formatter = new AsYouType(country);
              const formatted = formatter.input(e.target.value);
              writeBack(formatted, country);
            }}
            onBlur={field.onBlur}
            className="flex-1"
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

function inferCountry(value: string, fallback: CountryCode): CountryCode {
  try {
    const p = parsePhoneNumber(value);
    if (p.country) return p.country;
  } catch {
    /* ignore */
  }
  return fallback;
}

function formatNational(value: string, country: CountryCode): string {
  try {
    return parsePhoneNumber(value, country).formatNational();
  } catch {
    return value;
  }
}

export interface PhoneInputProps
  extends
    InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  defaultCountry?: CountryCode;
  allowedCountries?: readonly CountryCode[];
  disabled?: boolean;
}
```

- [ ] **Step 4** — append export: `export * from "./phone-input";`
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit:

```bash
git add src/stories/admin/phone-input.stories.tsx src/components/admin/phone-input.tsx src/components/admin/phone-input.spec.tsx src/components/admin/index.ts
git commit -m "feat(phone-input): add PhoneInput component + story + spec"
```

### Task 5.6: Doc pages for `<PhoneField>` + `<PhoneInput>`

**Files:** Create `docs/src/content/docs/phone-field.md`, `docs/src/content/docs/phone-input.md`

- [ ] **Step 1** — write `phone-field.md`:

````markdown
---
title: "PhoneField"
---

Displays an E.164 phone number as a formatted label, optionally wrapped in a
`tel:` link.

## Usage

```tsx
import { PhoneField } from '@/components/admin';

<PhoneField source="phone" />
<PhoneField source="phone" displayFormat="international" />
<PhoneField source="phone" link={false} />
```

## Props

| Prop            | Required | Type                            | Default      | Description                   |
| --------------- | -------- | ------------------------------- | ------------ | ----------------------------- |
| `source`        | Required | `string`                        | -            | Record field to read          |
| `displayFormat` | Optional | `"national" \| "international"` | `"national"` | Format style                  |
| `link`          | Optional | `boolean`                       | `true`       | Wrap value in a `tel:` link   |
| `empty`         | Optional | `ReactNode`                     | -            | Fallback when value is `null` |
| `className`     | Optional | `string`                        | -            | CSS class                     |

## Storage format

E.164 strings (e.g. `+14155552671`). Unparseable values render as raw strings.
````

- [ ] **Step 2** — write `phone-input.md`:

````markdown
---
title: "PhoneInput"
---

Phone input that stores E.164 and renders a country selector plus a
national-format text input. Uses `libphonenumber-js` for parsing.

## Usage

```tsx
import { PhoneInput } from '@/components/admin';

<PhoneInput source="phone" />
<PhoneInput source="phone" defaultCountry="GB" />
<PhoneInput source="phone" allowedCountries={["US", "CA", "MX"]} />
```

## Props

| Prop               | Required | Type                       | Default  | Description                      |
| ------------------ | -------- | -------------------------- | -------- | -------------------------------- |
| `source`           | Required | `string`                   | -        | Form field name                  |
| `defaultCountry`   | Optional | `CountryCode`              | `"US"`   | Country used when value is empty |
| `allowedCountries` | Optional | `readonly CountryCode[]`   | All      | Restrict selectable countries    |
| `label`            | Optional | `string \| false`          | Inferred | Custom label, `false` to hide    |
| `helperText`       | Optional | `ReactNode`                | -        | Helper text                      |
| `disabled`         | Optional | `boolean`                  | `false`  | Disable both controls            |
| `defaultValue`     | Optional | `string`                   | -        | Initial E.164 value              |
| `validate`         | Optional | `Validator \| Validator[]` | -        | Validation                       |
| `className`        | Optional | `string`                   | -        | CSS class                        |

## Storage format

E.164 strings. The component parses every keystroke via `AsYouType` for live
formatting in the visible input; the form state holds canonical E.164.

## Dependency

`libphonenumber-js` (~140KB). Tree-shakes when only `parsePhoneNumber` and
`AsYouType` are imported.
````

- [ ] **Step 3** — commit:

```bash
git add docs/src/content/docs/phone-field.md docs/src/content/docs/phone-input.md
git commit -m "docs(phone): add PhoneField + PhoneInput documentation"
```

---

## Final task: Batch verification

- [ ] **Step 1** — run lint + typecheck + full test suite in parallel (single Bash batch via three tool calls in one message):

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

Expected: 0 lint errors, 0 type errors, all new specs pass plus existing suite stays green.

- [ ] **Step 2** — verify the doc-drift check still passes:

```bash
pnpm --filter docs run check-docs
```

Expected: PASS.

- [ ] **Step 3** — if any sidebar entries are missing, add them to `docs/astro.config.mjs` alongside other component entries. Commit:

```bash
git add docs/astro.config.mjs
git commit -m "docs(sidebar): add Tier 1 common inputs to sidebar"
```

- [ ] **Step 4** — view diff vs main:

```bash
git log main..HEAD --oneline
```

Expected: a series of `feat(...)` and `docs(...)` commits per component, plus the `chore(deps)` commit for libphonenumber-js.

---

## Out of scope (v1)

- **RatingInput** keyboard arrow-key navigation (left/right between stars). Each star is a focusable button; tab navigates between them. Full radiogroup arrow-key handling is a follow-up.
- **ColorInput** custom popover for oklch / rgb input. The native `<input type="color">` only emits 6-digit hex; full format-agnostic editing needs a popover-based picker.
- **CurrencyInput** localized number parsing (typing `1,234.56` in `de-DE`). Stick with `Intl.NumberFormat` for output and plain `Number()` for input parsing.
- **DurationInput** human-string input ("2h 30m" typed directly). Per-unit fields are the v1 UX.
- **PhoneInput** country flag emoji icons. Showing the flag inline requires either an emoji font + `Intl.DisplayNames` or an asset bundle.

These belong in a follow-up "polish pass" plan, not v1.

---

## Self-review notes

- All five component pairs follow the exact `number-input.tsx` / `number-field.tsx` shape.
- Every spec imports its stories (per `AGENTS.md`); every story uses `StoryAdmin`.
- Every component pair has both Field and Input.
- Per `AGENTS.md` "browser-suite cost": each task ends with a single-file `vitest` run, not the full suite. Full suite + typecheck + lint run only in the final batch verification.
- `index.ts` updates land in the same commit as the component to keep the suite green.
- The shared helper `parseIsoDuration` is exported from `duration-field.tsx` and re-used by `duration-input.tsx`.
- `libphonenumber-js` is the only new runtime dep.
- No TBD / TODO / placeholder markers in the plan.
- Types referenced in later tasks (`CountryCode`, `Unit`, `RatingFieldProps`, etc.) are defined within their own task — no forward references.

## Execution handoff

Plan saved at `docs/superpowers/plans/2026-05-16-tier-1-common-inputs.md`.

Each component pair (Rating, Color, Currency, Duration, Phone) is independent — they can be implemented in parallel by separate subagents, or serially. Per `CLAUDE.md` global rule, the default execution mode for this project is **subagent-driven-development**: dispatch one subagent per component pair (5 dispatches) or one per task (~25 dispatches). One subagent per component pair is recommended since each component is small enough to fit a single subagent context window.

Two execution options:

1. **Subagent-Driven (recommended)** — Main thread dispatches one subagent per component pair. Each subagent owns its story + spec + impl + index update + doc page in one pass. Main thread reviews between dispatches.
2. **Inline Execution** — Execute tasks sequentially in this session via `executing-plans`. Slower than parallel dispatch, but useful for learning the patterns interactively.

Pick one and proceed.
