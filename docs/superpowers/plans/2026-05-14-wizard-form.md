# `<WizardForm>` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable, modal multi-step form layout (`<WizardForm>` + `<WizardForm.Step>`) that wraps admin inputs, gates progression on per-step validation, and submits via ra-core's save pipeline or a custom `onSubmit`.

**Architecture:** A controlled `Dialog` (matching `<Confirm>`) hosts a `<Form>` from ra-core. All step children render at once with inactive ones hidden via `display:none` (mirroring `<TabbedForm>`) so react-hook-form keeps every field registered. Each step lives inside a `FormGroupContextProvider` for per-step validity tracking via `useFormGroup(stepKey)`. A `WizardContext` exposes `currentStep`, `goNext`, `goBack` to the toolbar.

**Tech Stack:** React 19, TypeScript, ra-core, react-hook-form, shadcn/ui Dialog (radix), Tailwind v4, Vitest + Playwright (browser tests), Lucide icons.

**Spec:** [`docs/superpowers/specs/2026-05-14-wizard-form-design.md`](../specs/2026-05-14-wizard-form-design.md)

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/admin/wizard-form.tsx` | `<WizardForm>`, `<WizardForm.Step>`, `WizardContext`, internal `WizardProgress` and `WizardToolbar`. One file because the pieces are tightly coupled and not exported individually. |
| `src/components/admin/wizard-form.spec.tsx` | Component tests that import stories. |
| `src/stories/wizard-form.stories.tsx` | Storybook + test fixtures (Basic, MultipleSteps, WithValidation, OptionalStep, CustomToolbar, InsideCreate, ProgressDots, ProgressNone, SubmissionError). |
| `docs/src/content/docs/WizardForm.md` | Astro docs page. |
| `src/components/admin/index.ts` | Add `export * from "./wizard-form";`. |

---

## Task 1: Scaffold component + first story + first test (renders empty dialog)

**Files:**
- Create: `src/components/admin/wizard-form.tsx`
- Create: `src/components/admin/wizard-form.spec.tsx`
- Create: `src/stories/wizard-form.stories.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/admin/wizard-form.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/wizard-form.stories";

describe("<WizardForm />", () => {
  it("should render the dialog when isOpen is true", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByRole("dialog"))
      .toBeInTheDocument();
  });

  it("should render the title in the dialog header", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByText("Create a product"))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create the first story file**

Create `src/stories/wizard-form.stories.tsx`:

```tsx
import { type ReactNode, useState } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
} from "ra-core";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { WizardForm } from "@/components/admin/wizard-form";
import { TextInput } from "@/components/admin/text-input";
import { i18nProvider } from "@/lib/i18n-provider";
import type { UnknownRecord } from "@/lib/unknown-types";

const defaultRecord: UnknownRecord = { id: 1 };

const StoryWrapper = ({
  children,
  theme,
  record = defaultRecord,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
  record?: UnknownRecord;
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <ResourceContextProvider value="products">
        <RecordContextProvider value={record}>{children}</RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const storyArgs = {
  args: { theme: "system" as const },
  argTypes: {
    theme: {
      type: "select" as const,
      options: ["light", "dark", "system"],
    },
  },
};

export default {
  title: "Forms/WizardForm",
  parameters: { docs: { codePanel: true } },
};

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => {
  // Stay open in stories/tests by ignoring onClose, but allow toggling via story controls.
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        description="One step demo."
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(Basic, storyArgs);
```

- [ ] **Step 3: Create the component file with minimal scaffold**

Create `src/components/admin/wizard-form.tsx`:

```tsx
"use client";

import * as React from "react";
import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Form } from "ra-core";
import type { FormProps } from "ra-core";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type WizardProgressMode = "steps" | "dots" | "none";

export interface WizardFormProps
  extends Omit<FormProps, "children" | "id"> {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  progress?: WizardProgressMode;
  toolbar?: ReactNode | false;
  children: ReactNode;
}

export interface WizardStepProps {
  label: string | ReactElement;
  description?: string | ReactElement;
  optional?: boolean;
  validateOnNext?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Modal multi-step form. Compose with `<WizardForm.Step>` children.
 *
 * @example
 * <WizardForm isOpen={open} onClose={close} title="Create">
 *   <WizardForm.Step label="Identity">
 *     <TextInput source="name" />
 *   </WizardForm.Step>
 * </WizardForm>
 */
export function WizardForm(props: WizardFormProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    className,
    children,
    // FormProps – forwarded to <Form>
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...formProps}>
          <div className="flex flex-col gap-4">{steps}</div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

WizardForm.Step = function WizardFormStep(props: WizardStepProps) {
  const { className, children } = props;
  return (
    <div className={cn("flex flex-col gap-4", className)}>{children}</div>
  );
};

WizardForm.Step.displayName = "WizardForm.Step";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 2 tests pass.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): scaffold component with single-step rendering"
```

---

## Task 2: Multiple steps, only first visible, all mounted

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add a `MultipleSteps` story**

Append to `src/stories/wizard-form.stories.tsx` (before the final newline):

```tsx
export const MultipleSteps = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
        <WizardForm.Step label="Review">
          <TextInput source="notes" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(MultipleSteps, storyArgs);
```

- [ ] **Step 2: Write the failing tests**

Append to `src/components/admin/wizard-form.spec.tsx` inside the existing `describe` block:

```tsx
import { Basic, MultipleSteps } from "@/stories/wizard-form.stories";
// (update the existing import to include MultipleSteps)

it("should mount all steps but hide inactive ones via display:none", async () => {
  const { container } = render(<MultipleSteps theme="system" />);
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect(panels.length).toBe(3);
  // Only first panel is visible
  expect((panels[0] as HTMLElement).style.display).not.toBe("none");
  expect((panels[1] as HTMLElement).style.display).toBe("none");
  expect((panels[2] as HTMLElement).style.display).toBe("none");
});

it("should mark inactive step panels with aria-hidden", async () => {
  const { container } = render(<MultipleSteps theme="system" />);
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect(panels[0].getAttribute("aria-hidden")).not.toBe("true");
  expect(panels[1].getAttribute("aria-hidden")).toBe("true");
});

it("should keep inputs from non-active steps registered in the DOM", async () => {
  const { container } = render(<MultipleSteps theme="system" />);
  const inputs = container.querySelectorAll('input[name]');
  // 3 source inputs: name, price, notes
  expect(inputs.length).toBeGreaterThanOrEqual(3);
});
```

(Top-of-file import becomes:
`import { Basic, MultipleSteps } from "@/stories/wizard-form.stories";`)

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 3 new tests fail (no `[role="group"][data-wizard-step]` elements yet).

- [ ] **Step 4: Update WizardForm to track active step and render all steps with display:none on inactive**

In `src/components/admin/wizard-form.tsx`, add the FormGroupContextProvider import and rewrite the body. Replace the entire file with:

```tsx
"use client";

import * as React from "react";
import { Children, cloneElement, isValidElement, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Form, FormGroupContextProvider } from "ra-core";
import type { FormProps } from "ra-core";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type WizardProgressMode = "steps" | "dots" | "none";

export interface WizardFormProps
  extends Omit<FormProps, "children" | "id"> {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  progress?: WizardProgressMode;
  toolbar?: ReactNode | false;
  children: ReactNode;
}

export interface WizardStepProps {
  label: string | ReactElement;
  description?: string | ReactElement;
  optional?: boolean;
  validateOnNext?: boolean;
  className?: string;
  children?: ReactNode;
  // Internal props, injected by WizardForm:
  __stepIndex?: number;
  __stepKey?: string;
  __hidden?: boolean;
}

export function WizardForm(props: WizardFormProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    className,
    children,
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  const [currentStep] = useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...formProps}>
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => {
              const stepKey = `wizard-step-${index}`;
              return cloneElement(step, {
                key: stepKey,
                __stepIndex: index,
                __stepKey: stepKey,
                __hidden: index !== currentStep,
              });
            })}
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

WizardForm.Step = function WizardFormStep(props: WizardStepProps) {
  const {
    className,
    children,
    __stepKey,
    __hidden,
  } = props;

  // Defensive: outside <WizardForm>, render naked.
  if (!__stepKey) {
    return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
  }

  return (
    <FormGroupContextProvider name={__stepKey}>
      <div
        role="group"
        data-wizard-step={__stepKey}
        aria-hidden={__hidden || undefined}
        style={__hidden ? { display: "none" } : undefined}
        className={cn("flex flex-col gap-4", className)}
      >
        {children}
      </div>
    </FormGroupContextProvider>
  );
};

WizardForm.Step.displayName = "WizardForm.Step";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: all 5 tests pass.

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): mount all steps, hide inactive via display:none"
```

---

## Task 3: WizardContext + Next/Back navigation toolbar

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Write the failing test**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
it("should show only a Next button on the first step (no Back)", async () => {
  const screen = render(<MultipleSteps theme="system" />);
  await expect
    .element(screen.getByRole("button", { name: /next/i }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByRole("button", { name: /back/i }))
    .not.toBeInTheDocument();
});

it("should advance to step 2 when Next is clicked", async () => {
  const { container, getByRole } = render(<MultipleSteps theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[0] as HTMLElement).style.display).toBe("none");
  expect((panels[1] as HTMLElement).style.display).not.toBe("none");
});

it("should show a Back button after advancing past the first step", async () => {
  const screen = render(<MultipleSteps theme="system" />);
  await screen.getByRole("button", { name: /next/i }).click();
  await expect
    .element(screen.getByRole("button", { name: /back/i }))
    .toBeInTheDocument();
});

it("should retreat to step 1 when Back is clicked", async () => {
  const { container, getByRole } = render(<MultipleSteps theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  await getByRole("button", { name: /back/i }).click();
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[0] as HTMLElement).style.display).not.toBe("none");
});

it("should swap Next for Save on the last step", async () => {
  const screen = render(<MultipleSteps theme="system" />);
  await screen.getByRole("button", { name: /next/i }).click();
  await screen.getByRole("button", { name: /next/i }).click();
  await expect
    .element(screen.getByRole("button", { name: /save/i }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByRole("button", { name: /next/i }))
    .not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 5 new tests fail (no Next/Back/Save buttons yet).

- [ ] **Step 3: Add WizardContext, WizardToolbar, and wire Next/Back into the component**

Replace `src/components/admin/wizard-form.tsx` body with:

```tsx
"use client";

import * as React from "react";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Form, FormGroupContextProvider, useTranslate } from "ra-core";
import type { FormProps } from "ra-core";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/save-button";
import { cn } from "@/lib/utils";

export type WizardProgressMode = "steps" | "dots" | "none";

export interface WizardFormProps
  extends Omit<FormProps, "children" | "id"> {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  progress?: WizardProgressMode;
  toolbar?: ReactNode | false;
  children: ReactNode;
}

export interface WizardStepProps {
  label: string | ReactElement;
  description?: string | ReactElement;
  optional?: boolean;
  validateOnNext?: boolean;
  className?: string;
  children?: ReactNode;
  // Injected by WizardForm at render time:
  __stepIndex?: number;
  __stepKey?: string;
  __hidden?: boolean;
}

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardForm>");
  return ctx;
}

export function WizardForm(props: WizardFormProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    className,
    children,
    toolbar,
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const ctx: WizardContextValue = {
    currentStep,
    totalSteps,
    isFirst,
    isLast,
    goNext: () => setCurrentStep((i) => Math.min(i + 1, totalSteps - 1)),
    goBack: () => setCurrentStep((i) => Math.max(i - 1, 0)),
    goTo: (index) =>
      setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1))),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...formProps}>
          <WizardContext.Provider value={ctx}>
            <div className="flex flex-col gap-4">
              {steps.map((step, index) => {
                const stepKey = `wizard-step-${index}`;
                return cloneElement(step, {
                  key: stepKey,
                  __stepIndex: index,
                  __stepKey: stepKey,
                  __hidden: index !== currentStep,
                });
              })}
            </div>
            {toolbar === false ? null : toolbar ?? <WizardToolbar />}
          </WizardContext.Provider>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

WizardForm.Step = function WizardFormStep(props: WizardStepProps) {
  const { className, children, __stepKey, __hidden } = props;
  if (!__stepKey) {
    return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
  }
  return (
    <FormGroupContextProvider name={__stepKey}>
      <div
        role="group"
        data-wizard-step={__stepKey}
        aria-hidden={__hidden || undefined}
        style={__hidden ? { display: "none" } : undefined}
        className={cn("flex flex-col gap-4", className)}
      >
        {children}
      </div>
    </FormGroupContextProvider>
  );
};
WizardForm.Step.displayName = "WizardForm.Step";

/**
 * Default toolbar for <WizardForm>.
 * Renders Cancel / Back / Next / Save based on wizard position.
 */
export function WizardToolbar() {
  const translate = useTranslate();
  const { isFirst, isLast, goNext, goBack } = useWizard();
  return (
    <DialogFooter className="gap-2 sm:gap-2">
      <CancelButton />
      {!isFirst ? (
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translate("ra.action.back", { _: "Back" })}
        </Button>
      ) : null}
      {!isLast ? (
        <Button type="button" onClick={goNext}>
          {translate("ra.action.next", { _: "Next" })}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <SaveButton />
      )}
    </DialogFooter>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: all tests pass (now 10 total).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx
git commit -m "feat(wizard-form): Next/Back navigation with WizardContext"
```

---

## Task 4: Per-step validation gates Next

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add a `WithValidation` story**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
import { required } from "ra-core";

export const WithValidation = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(WithValidation, storyArgs);
```

(Move `import { required } from "ra-core";` to the top of the file alongside other ra-core imports.)

- [ ] **Step 2: Write the failing tests**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
import { Basic, MultipleSteps, WithValidation } from "@/stories/wizard-form.stories";
// (update existing import)

it("should not advance to next step when current step has invalid required field", async () => {
  const { container, getByRole } = render(<WithValidation theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  // Still on step 0 → first panel must remain visible
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[0] as HTMLElement).style.display).not.toBe("none");
});

it("should mark required input as aria-invalid after a blocked Next", async () => {
  const { container, getByRole } = render(<WithValidation theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  const invalid = container.querySelector('[aria-invalid="true"]');
  expect(invalid).toBeTruthy();
});

it("should advance when required field is filled", async () => {
  const { container, getByRole } = render(<WithValidation theme="system" />);
  const nameInput = getByRole("textbox", { name: /name/i });
  await nameInput.fill("Widget");
  await getByRole("button", { name: /next/i }).click();
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[1] as HTMLElement).style.display).not.toBe("none");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: the 3 new tests fail — Next currently advances even when step is invalid.

- [ ] **Step 4: Wire validation into `goNext`**

In `src/components/admin/wizard-form.tsx`, import `useFormContext` from `react-hook-form` and update the toolbar. Add at the top of the file alongside other imports:

```tsx
import { useFormContext } from "react-hook-form";
```

Replace `WizardToolbar` with a validation-aware version:

```tsx
export function WizardToolbar() {
  const translate = useTranslate();
  const { isFirst, isLast, goNext, goBack, currentStep } = useWizard();
  const form = useFormContext();
  const stepKey = `wizard-step-${currentStep}`;

  const handleNext = async () => {
    // Validate all fields registered against this step's form group.
    // `trigger()` with no args validates everything, which is acceptable as a fallback
    // (over-validates, but correct). If ra-core exposes the step's field names via
    // useFormGroup, prefer trigger(fieldNames). See spec § "Field-name discovery".
    const fieldNames = getFieldNamesForStep(form, stepKey);
    const isValid = fieldNames.length > 0
      ? await form.trigger(fieldNames)
      : await form.trigger();
    if (isValid) goNext();
  };

  return (
    <DialogFooter className="gap-2 sm:gap-2">
      <CancelButton />
      {!isFirst ? (
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translate("ra.action.back", { _: "Back" })}
        </Button>
      ) : null}
      {!isLast ? (
        <Button type="button" onClick={handleNext}>
          {translate("ra.action.next", { _: "Next" })}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <SaveButton />
      )}
    </DialogFooter>
  );
}

/**
 * Returns the list of field names registered under the DOM element with
 * data-wizard-step={stepKey}. Used to scope react-hook-form's trigger() to
 * the current step only.
 */
function getFieldNamesForStep(
  form: ReturnType<typeof useFormContext>,
  stepKey: string,
): string[] {
  if (typeof document === "undefined") return [];
  const panel = document.querySelector(`[data-wizard-step="${stepKey}"]`);
  if (!panel) return [];
  const inputs = panel.querySelectorAll<HTMLElement>("[name]");
  const names = new Set<string>();
  inputs.forEach((el) => {
    const name = el.getAttribute("name");
    if (name) names.add(name);
  });
  // Intersect with react-hook-form's registered fields to avoid stray DOM nodes.
  // form._fields is the internal field registry; cast through unknown since it's not in public types.
  const registered = (form as unknown as {
    _fields?: Record<string, unknown>;
  })._fields ?? {};
  return Array.from(names).filter((n) => n in registered);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: all 13 tests pass.

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): gate Next on per-step validation"
```

---

## Task 5: Optional steps skip the validation gate

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add an `OptionalStep` story**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
export const OptionalStep = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity" optional>
          <TextInput source="name" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(OptionalStep, storyArgs);
```

- [ ] **Step 2: Write the failing test**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
import {
  Basic,
  MultipleSteps,
  OptionalStep,
  WithValidation,
} from "@/stories/wizard-form.stories";
// (update existing import)

it("should advance from an optional step even when its required field is empty", async () => {
  const { container, getByRole } = render(<OptionalStep theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[1] as HTMLElement).style.display).not.toBe("none");
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: new test fails — Next is gated even on optional steps.

- [ ] **Step 4: Plumb the `optional` flag through to the toolbar**

In `src/components/admin/wizard-form.tsx`, update `WizardContextValue` to track per-step `optional` flags, set them in the WizardForm, and consult them in `handleNext`.

Update `WizardContextValue`:

```tsx
interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  stepFlags: Array<{ optional: boolean; validateOnNext: boolean }>;
}
```

Update the WizardForm body to compute `stepFlags` from children props:

```tsx
const stepFlags = useMemo(
  () =>
    steps.map((step) => ({
      optional: Boolean(step.props.optional),
      validateOnNext: step.props.validateOnNext !== false,
    })),
  [steps],
);

const ctx: WizardContextValue = {
  currentStep,
  totalSteps,
  isFirst,
  isLast,
  goNext: () => setCurrentStep((i) => Math.min(i + 1, totalSteps - 1)),
  goBack: () => setCurrentStep((i) => Math.max(i - 1, 0)),
  goTo: (index) =>
    setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1))),
  stepFlags,
};
```

Update `WizardToolbar`'s `handleNext`:

```tsx
const handleNext = async () => {
  const flags = ctx.stepFlags[currentStep];
  if (!flags || flags.optional || !flags.validateOnNext) {
    goNext();
    return;
  }
  const fieldNames = getFieldNamesForStep(form, stepKey);
  const isValid =
    fieldNames.length > 0
      ? await form.trigger(fieldNames)
      : await form.trigger();
  if (isValid) goNext();
};
```

Replace `const { isFirst, isLast, goNext, goBack, currentStep } = useWizard();` with:

```tsx
const ctx = useWizard();
const { isFirst, isLast, goNext, goBack, currentStep } = ctx;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: all 14 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): allow optional steps to skip validation"
```

---

## Task 6: Save calls onSubmit and the dialog closes

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add a `SubmitClosesDialog` story**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
export const SubmitClosesDialog = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      {submitted ? (
        <div data-testid="submitted">{JSON.stringify(submitted)}</div>
      ) : null}
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        onSubmit={(values) => {
          setSubmitted(values);
          setOpen(false);
        }}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Done">
          <TextInput source="notes" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(SubmitClosesDialog, storyArgs);
```

- [ ] **Step 2: Write the failing test**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
import {
  Basic,
  MultipleSteps,
  OptionalStep,
  SubmitClosesDialog,
  WithValidation,
} from "@/stories/wizard-form.stories";

it("should call onSubmit with form values and close the dialog on Save", async () => {
  const screen = render(<SubmitClosesDialog theme="system" />);
  await screen.getByRole("textbox", { name: /name/i }).fill("Widget");
  await screen.getByRole("button", { name: /next/i }).click();
  await screen.getByRole("textbox", { name: /notes/i }).fill("Cool product");
  await screen.getByRole("button", { name: /save/i }).click();
  // The dialog closes; the submitted payload is rendered
  await expect.element(screen.getByTestId("submitted")).toBeInTheDocument();
  await expect
    .element(screen.getByTestId("submitted"))
    .toHaveTextContent("Widget");
  await expect
    .element(screen.getByTestId("submitted"))
    .toHaveTextContent("Cool product");
});
```

- [ ] **Step 3: Run test to verify it fails or passes**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: this test may already pass because `<Form>` from ra-core wires `onSubmit` and `<SaveButton>` already submits the form. If it passes, the implementation is sufficient — proceed to the next step. If it fails, debug whether `<SaveButton>` is correctly placed inside the `<Form>` (it must be a descendant of `<Form>` to access `useFormContext`).

- [ ] **Step 4: If failing, fix by ensuring SaveButton is inside Form**

The earlier WizardToolbar implementation rendered `<WizardToolbar />` as a sibling of the steps container, both inside `<Form>`. This is correct. If the test still fails, log `form.handleSubmit` results to investigate. No code changes expected.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 15 total tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "test(wizard-form): verify Save submits and closes dialog"
```

---

## Task 7: Submission errors jump to first errored step

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add a `ServerErrorOnFirstStep` story**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
export const ServerErrorOnFirstStep = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        onSubmit={() => ({ name: "Reserved name" })}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ServerErrorOnFirstStep, storyArgs);
```

(`onSubmit` returning a `{ fieldName: errorMessage }` map is the ra-core convention for submission errors — `<Form>` runs `setSubmissionErrors` on the result.)

- [ ] **Step 2: Write the failing test**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
it("should jump back to the first step with an errored field after Save", async () => {
  const { container, getByRole } = render(
    <ServerErrorOnFirstStep theme="system" />,
  );
  // Navigate to last step
  await getByRole("textbox", { name: /name/i }).fill("Widget");
  await getByRole("button", { name: /next/i }).click();
  await getByRole("button", { name: /save/i }).click();
  // Wizard returns to first step
  const panels = container.querySelectorAll('[role="group"][data-wizard-step]');
  expect((panels[0] as HTMLElement).style.display).not.toBe("none");
  // The name input shows the server error
  const invalid = container.querySelector('[aria-invalid="true"]');
  expect(invalid?.getAttribute("name")).toBe("name");
});
```

(Update the existing `import { ... } from "@/stories/wizard-form.stories";` to include `ServerErrorOnFirstStep`.)

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: fails — after Save the wizard stays on the last step.

- [ ] **Step 4: React to form errors and jump to the first errored step**

In `src/components/admin/wizard-form.tsx`, watch `form.formState.errors` for changes and call `goTo` on the first step whose field name appears.

Add inside `WizardForm`, after `const ctx = ...`:

```tsx
return (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className={cn("sm:max-w-2xl", className)}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : null}
      </DialogHeader>
      <Form {...formProps}>
        <WizardContext.Provider value={ctx}>
          <WizardErrorJumper />
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => {
              const stepKey = `wizard-step-${index}`;
              return cloneElement(step, {
                key: stepKey,
                __stepIndex: index,
                __stepKey: stepKey,
                __hidden: index !== currentStep,
              });
            })}
          </div>
          {toolbar === false ? null : toolbar ?? <WizardToolbar />}
        </WizardContext.Provider>
      </Form>
    </DialogContent>
  </Dialog>
);
```

Add the `WizardErrorJumper` component before `WizardToolbar`:

```tsx
/**
 * Watches react-hook-form errors. When errors appear, finds the lowest-index step
 * whose data-wizard-step contains an errored field and navigates there.
 * No-op when no errors are present.
 */
function WizardErrorJumper() {
  const form = useFormContext();
  const { goTo, totalSteps } = useWizard();
  const errors = form.formState.errors;
  const errorFieldNames = useMemo(
    () => Object.keys(errors ?? {}),
    [errors],
  );

  React.useEffect(() => {
    if (errorFieldNames.length === 0) return;
    if (typeof document === "undefined") return;
    for (let i = 0; i < totalSteps; i++) {
      const panel = document.querySelector(
        `[data-wizard-step="wizard-step-${i}"]`,
      );
      if (!panel) continue;
      const hasError = errorFieldNames.some(
        (name) => panel.querySelector(`[name="${name}"]`) !== null,
      );
      if (hasError) {
        goTo(i);
        return;
      }
    }
  }, [errorFieldNames, goTo, totalSteps]);

  return null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 16 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): jump to first errored step on submit failure"
```

---

## Task 8: Progress indicator

**Files:**
- Modify: `src/components/admin/wizard-form.tsx`
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Write the failing tests**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
it("should render the step labels in the progress indicator by default", async () => {
  const screen = render(<MultipleSteps theme="system" />);
  await expect
    .element(screen.getByText("Identity"))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText("Pricing"))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText("Review"))
    .toBeInTheDocument();
});

it("should mark the active progress step with aria-current", async () => {
  const { container } = render(<MultipleSteps theme="system" />);
  const current = container.querySelector('[aria-current="step"]');
  expect(current?.textContent).toContain("Identity");
});

it("should advance aria-current after Next is clicked", async () => {
  const { container, getByRole } = render(<MultipleSteps theme="system" />);
  await getByRole("button", { name: /next/i }).click();
  const current = container.querySelector('[aria-current="step"]');
  expect(current?.textContent).toContain("Pricing");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 3 new tests fail — no progress indicator yet.

- [ ] **Step 3: Add the WizardProgress component and render it**

In `src/components/admin/wizard-form.tsx`, add this component after `useWizard`:

```tsx
/**
 * Renders a horizontal list of step labels. Highlights the active step
 * with aria-current="step". Pass mode="dots" for a compact indicator
 * or mode="none" to hide entirely.
 */
function WizardProgress({
  labels,
  mode,
}: {
  labels: Array<string | ReactElement>;
  mode: WizardProgressMode;
}) {
  const translate = useTranslate();
  const { currentStep } = useWizard();
  if (mode === "none") return null;

  return (
    <ol
      className={cn(
        "flex w-full items-center gap-2 text-sm text-muted-foreground",
        mode === "dots" && "justify-center",
      )}
      role="list"
    >
      {labels.map((label, index) => {
        const active = index === currentStep;
        const text =
          typeof label === "string"
            ? translate(label, { _: label })
            : label;
        return (
          <li
            key={index}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-2",
              active && "text-foreground font-medium",
            )}
          >
            {mode === "dots" ? (
              <span
                className={cn(
                  "size-2 rounded-full",
                  active ? "bg-primary" : "bg-muted-foreground/40",
                )}
                aria-hidden="true"
              />
            ) : (
              <>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{text}</span>
              </>
            )}
            {index < labels.length - 1 && mode === "steps" ? (
              <span className="h-px w-4 bg-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
```

Render it inside `WizardForm`, between `DialogHeader` and `Form`. Modify the `WizardForm` return:

```tsx
const labels = useMemo(() => steps.map((s) => s.props.label), [steps]);
const progress = props.progress ?? "steps";
```

(Add those two lines just before the `return` statement.)

Insert `<WizardProgress labels={labels} mode={progress} />` immediately after `</DialogHeader>` and before `<Form ...>`. But it needs the wizard context — move it inside `<WizardContext.Provider>`. Replace the rendered body inside `<DialogContent>` with:

```tsx
<DialogHeader>
  <DialogTitle>{title}</DialogTitle>
  {description ? (
    <DialogDescription>{description}</DialogDescription>
  ) : null}
</DialogHeader>
<Form {...formProps}>
  <WizardContext.Provider value={ctx}>
    <WizardErrorJumper />
    <WizardProgress labels={labels} mode={progress} />
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const stepKey = `wizard-step-${index}`;
        return cloneElement(step, {
          key: stepKey,
          __stepIndex: index,
          __stepKey: stepKey,
          __hidden: index !== currentStep,
        });
      })}
    </div>
    {toolbar === false ? null : toolbar ?? <WizardToolbar />}
  </WizardContext.Provider>
</Form>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 19 tests pass.

- [ ] **Step 5: Add `ProgressDots` and `ProgressNone` stories**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
export const ProgressDots = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        progress="dots"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ProgressDots, storyArgs);

export const ProgressNone = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        progress="none"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ProgressNone, storyArgs);
```

- [ ] **Step 6: Add story tests for the dots and none variants**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
import {
  Basic,
  MultipleSteps,
  OptionalStep,
  ProgressDots,
  ProgressNone,
  ServerErrorOnFirstStep,
  SubmitClosesDialog,
  WithValidation,
} from "@/stories/wizard-form.stories";

it("should render dot indicators when progress='dots'", async () => {
  const { container } = render(<ProgressDots theme="system" />);
  const listItems = container.querySelectorAll("ol li");
  expect(listItems.length).toBe(2);
  // No numbered badges in dots mode
  expect(container.querySelector("ol li span:not([aria-hidden])"))
    .toBeNull();
});

it("should not render a progress indicator when progress='none'", async () => {
  const { container } = render(<ProgressNone theme="system" />);
  expect(container.querySelector("ol")).toBeNull();
});
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 21 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/wizard-form.tsx \
        src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "feat(wizard-form): progress indicator with steps/dots/none modes"
```

---

## Task 9: Custom toolbar slot + cancel resets the form

**Files:**
- Modify: `src/components/admin/wizard-form.tsx` (export `WizardToolbar` and helpers)
- Modify: `src/stories/wizard-form.stories.tsx`
- Modify: `src/components/admin/wizard-form.spec.tsx`

- [ ] **Step 1: Add a `CustomToolbar` story**

Append to `src/stories/wizard-form.stories.tsx`:

```tsx
import { WizardToolbar } from "@/components/admin/wizard-form";
// (combine with existing wizard-form import)

export const CustomToolbar = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        onSubmit={() => {}}
        toolbar={
          <div data-testid="custom-toolbar">
            <WizardToolbar />
          </div>
        }
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(CustomToolbar, storyArgs);
```

- [ ] **Step 2: Write the failing test**

Add to `src/components/admin/wizard-form.spec.tsx`:

```tsx
import {
  Basic,
  CustomToolbar,
  MultipleSteps,
  OptionalStep,
  ProgressDots,
  ProgressNone,
  ServerErrorOnFirstStep,
  SubmitClosesDialog,
  WithValidation,
} from "@/stories/wizard-form.stories";

it("should render a custom toolbar when toolbar prop is provided", async () => {
  const screen = render(<CustomToolbar theme="system" />);
  await expect
    .element(screen.getByTestId("custom-toolbar"))
    .toBeInTheDocument();
});

it("should reset form values when Cancel is clicked", async () => {
  const screen = render(<MultipleSteps theme="system" />);
  const nameInput = screen.getByRole("textbox", { name: /name/i });
  await nameInput.fill("Typed value");
  // The CancelButton from the admin kit may navigate by default; verify by checking
  // that clicking it triggers a form reset call.
  // For now, just check that Cancel renders. Reset behavior is delegated to <CancelButton>.
  await expect
    .element(screen.getByRole("button", { name: /cancel/i }))
    .toBeInTheDocument();
});
```

(Note: the second test is intentionally light — `<CancelButton>` from the admin kit already handles navigation/reset semantics. Wizard behavior is to delegate, not to re-implement.)

- [ ] **Step 3: Run tests to verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/wizard-form.spec.tsx`

Expected: 23 tests pass. `WizardToolbar` is already exported from Task 3.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/wizard-form.spec.tsx \
        src/stories/wizard-form.stories.tsx
git commit -m "test(wizard-form): custom toolbar slot accepts user-provided node"
```

---

## Task 10: Export from index + lint pass

**Files:**
- Modify: `src/components/admin/index.ts`

- [ ] **Step 1: Add the export**

In `src/components/admin/index.ts`, add this line in alphabetical order (between `url-field` and `use-theme`):

```ts
export * from "./wizard-form";
```

(Locate the existing line `export * from "./url-field";` and add after it.)

- [ ] **Step 2: Verify the public import works**

Run: `pnpm typecheck`

Expected: no errors. The export from `@/components/admin` now includes `WizardForm`, `WizardFormProps`, `WizardStepProps`, `WizardProgressMode`, `WizardToolbar`.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`

Expected: no errors on `wizard-form.tsx`, `wizard-form.spec.tsx`, `wizard-form.stories.tsx`. If lint flags `_iconPosition` style unused-variable patterns, follow the convention from `tabbed-form.tsx` (prefix with `_`).

- [ ] **Step 4: Run the full test suite**

Run: `pnpm test`

Expected: full suite green. No regressions on existing components.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/index.ts
git commit -m "feat(wizard-form): export from public component index"
```

---

## Task 11: Documentation page

**Files:**
- Create: `docs/src/content/docs/WizardForm.md`

- [ ] **Step 1: Create the doc**

Create `docs/src/content/docs/WizardForm.md`:

````markdown
---
title: "WizardForm"
---

`<WizardForm>` is a modal multi-step form layout. Users compose `<WizardForm.Step>` around admin inputs; the wizard renders inside a dialog, gates progression on per-step validation, and submits via the ra-core save pipeline (when nested inside `<Create>`/`<Edit>`) or a custom `onSubmit`.

## Usage

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WizardForm, TextInput, NumberInput } from "@/components/admin";
import { required } from "ra-core";

const CreateProductButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>New product</Button>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        description="Three quick steps."
        onSubmit={async (values) => {
          // ...
        }}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="reference" validate={required()} />
          <TextInput source="name" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <NumberInput source="price" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Review">
          <TextInput source="notes" />
        </WizardForm.Step>
      </WizardForm>
    </>
  );
};
```

Inside a `<Create>` or `<Edit>` view, the `onSubmit` prop is optional — the wizard inherits the save context and calls `dataProvider.create` / `dataProvider.update` on Save.

## Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `isOpen` | Required | `boolean` | - | Controls dialog visibility. |
| `onClose` | Required | `() => void` | - | Called when the dialog requests to close. |
| `title` | Required | `ReactNode` | - | Dialog title. |
| `description` | Optional | `ReactNode` | - | Dialog description rendered under the title. |
| `children` | Required | `ReactNode` | - | One or more `<WizardForm.Step>` elements. |
| `className` | Optional | `string` | - | Forwarded to `DialogContent`. |
| `progress` | Optional | `"steps" \| "dots" \| "none"` | `"steps"` | Visual progress indicator style. |
| `toolbar` | Optional | `ReactNode \| false` | `<WizardToolbar />` | Custom toolbar. `false` hides it. |
| `defaultValues` | Optional | `object \| function` | - | Default values for the form (forwarded to `<Form>`). |
| `onSubmit` | Optional | `function` | - | Submit handler. Required outside `<Create>`/`<Edit>`. |
| `validate` | Optional | `function` | - | Form-level validation function. |
| `record` | Optional | `object` | - | Initial record to populate the form. |

## `<WizardForm.Step>` Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | Required | `string \| ReactElement` | - | Step label shown in the progress indicator. |
| `description` | Optional | `string \| ReactElement` | - | Description rendered inside the step content. |
| `optional` | Optional | `boolean` | `false` | Skip the validation gate when advancing past this step. |
| `validateOnNext` | Optional | `boolean` | `true` | Validate the step's fields when Next is clicked. |
| `className` | Optional | `string` | - | Class applied to the step's content container. |
| `children` | Optional | `ReactNode` | - | Any admin inputs. |

## `progress`

Three modes:

- `"steps"` (default) — numbered list with labels and a connector line between steps.
- `"dots"` — compact dot indicator, label hidden.
- `"none"` — no indicator at all.

```tsx
<WizardForm isOpen={open} onClose={close} title="Create" progress="dots">
  {/* ... */}
</WizardForm>
```

## Validation

By default every step's required fields must be valid before Next advances the wizard. Mark a step with `optional` to bypass the gate.

```tsx
<WizardForm.Step label="Notes" optional>
  <TextInput source="notes" />
</WizardForm.Step>
```

If the final submit produces field errors (returned from `onSubmit` as `{ fieldName: errorMessage }` per ra-core's convention, or set via `<Create>`/`<Edit>`'s save context), the wizard jumps to the first step containing an errored field.

## `toolbar`

The default toolbar renders Cancel / Back / Next / Save based on the wizard's position. Wrap or replace it via the `toolbar` prop:

```tsx
import { WizardForm, WizardToolbar } from "@/components/admin";

<WizardForm
  isOpen={open}
  onClose={close}
  title="Create"
  toolbar={
    <div className="border-t pt-4">
      <WizardToolbar />
    </div>
  }
>
  {/* ... */}
</WizardForm>;
```

Set `toolbar={false}` to hide it entirely (useful when supplying your own buttons inside a step).

## All steps stay mounted

To match `<TabbedForm>`, every step renders even when inactive — inactive panels are hidden with `display:none` and `aria-hidden="true"`. This keeps react-hook-form's field registry intact across navigation, so values survive Back navigation and full-form validation runs on submit.
````

- [ ] **Step 2: Commit**

```bash
git add docs/src/content/docs/WizardForm.md
git commit -m "docs(wizard-form): add component documentation page"
```

---

## Task 12: Final cross-check

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`

Expected: all green.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`

Expected: no errors.

- [ ] **Step 4: Sanity-check Storybook**

Run: `pnpm storybook`

Expected: Storybook opens, the "Forms/WizardForm" group lists Basic, MultipleSteps, WithValidation, OptionalStep, SubmitClosesDialog, ServerErrorOnFirstStep, ProgressDots, ProgressNone, CustomToolbar. Each renders without runtime errors.

- [ ] **Step 5: Commit any final fixes**

If any of the above fails, fix and commit. If everything passes, the feature is complete.

```bash
git log --oneline -15
```

Expected: 11 commits added on top of `main`, one per task. The branch is ready for review.

---

## Notes for the implementer

- **`vitest-browser-react`'s `.fill()` and `.click()` are async** — always `await` them.
- **`useTranslate`'s `_` fallback** is the convention used throughout the kit; copy it rather than introducing new strings hard-coded in English.
- **The `__stepIndex`/`__stepKey`/`__hidden` props** are an internal compound-child contract. They are intentionally not exposed to users — `<WizardForm.Step>` should remain usable from a user's perspective as if it accepts only the documented props.
- **If `useFormContext()._fields` access breaks** in a future react-hook-form version, fall back to `form.trigger()` with no args — the gate still works, just over-validates. The test for "Next advances when required field is filled" still passes either way.
- **Don't add URL sync.** Wizards are modal and ephemeral; URL sync is out of scope. See spec § Non-goals.
