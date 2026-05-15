# `<WizardForm>` — modal multi-step form

**Date:** 2026-05-14
**Status:** Draft

## Goal

Add a reusable, modal-based, multi-step form layout to shadcn-admin-kit. Users compose
a `<WizardForm.Step>` around their existing admin inputs; the wizard renders inside a
dialog, gates progress on per-step validation, and submits via the existing ra-core
save pipeline (or a custom `onSubmit`).

## Non-goals

- URL sync for the active step (wizards are ephemeral / modal — out of scope).
- Branching or conditional steps based on field values.
- Drag-to-reorder steps or runtime step injection.
- A non-modal `<WizardForm>` variant. Can extract later if asked.

## Public API

```tsx
import { useState } from "react";
import { WizardForm, TextInput, NumberInput } from "@/components/admin";
import { required } from "ra-core";
import { Button } from "@/components/ui/button";

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
          // optional — only required when not inside a Create/Edit context
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
          <ReviewSummary />
        </WizardForm.Step>
      </WizardForm>
    </>
  );
};
```

Inside `<Create>` or `<Edit>`, `onSubmit` is optional — the wizard reads
`useSaveContext()` like `<SaveButton>` already does.

## Props

### `<WizardForm>`

| Prop           | Type                          | Default         | Description                                                                                           |
| -------------- | ----------------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `isOpen`       | `boolean`                     | —               | Controls dialog visibility. Required.                                                                 |
| `onClose`      | `() => void`                  | —               | Called when the dialog requests to close. Required.                                                   |
| `title`        | `ReactNode`                   | —               | Dialog title. Required.                                                                               |
| `description`  | `ReactNode`                   | `undefined`     | Dialog description shown under the title.                                                             |
| `className`    | `string`                      | `undefined`     | Forwarded to `DialogContent`.                                                                         |
| `progress`     | `"steps" \| "dots" \| "none"` | `"steps"`       | Visual progress indicator style.                                                                      |
| `toolbar`      | `ReactNode \| false`          | default toolbar | Custom toolbar. `false` hides it.                                                                     |
| `children`     | `ReactNode`                   | —               | One or more `<WizardForm.Step>` elements.                                                             |
| ...`FormProps` | from ra-core                  | —               | `onSubmit`, `defaultValues`, `record`, `validate`, `resolver`, `disableInvalidFormNotification`, etc. |

### `<WizardForm.Step>`

| Prop             | Type                     | Default     | Description                                                  |
| ---------------- | ------------------------ | ----------- | ------------------------------------------------------------ |
| `label`          | `string \| ReactElement` | —           | Shown in the progress indicator. Required.                   |
| `description`    | `string \| ReactElement` | `undefined` | Sub-header rendered inside the step content.                 |
| `optional`       | `boolean`                | `false`     | Skip the validation gate when advancing.                     |
| `validateOnNext` | `boolean`                | `true`      | Run RHF `trigger()` for this step's fields before advancing. |
| `className`      | `string`                 | `undefined` | Container class for step content.                            |
| `children`       | `ReactNode`              | —           | Any admin inputs.                                            |

## Architecture

```
WizardForm  (controlled dialog + Form from ra-core)
├── Dialog (radix wrapper, isOpen-controlled, matches <Confirm> pattern)
│   └── DialogContent
│       ├── DialogHeader  (title + description + submission-error alert)
│       ├── WizardProgress  (compact step indicator)
│       ├── WizardStepsContainer
│       │   └── all <WizardForm.Step> children rendered;
│       │       inactive ones hidden via `display: none` + `aria-hidden`
│       │       (same trick TabbedForm uses so validation runs everywhere)
│       └── WizardToolbar
│           ├── Cancel  (always)
│           ├── Back    (disabled on first step)
│           ├── Next    (when not last; gated by current step's useFormGroup.isValid)
│           └── Save    (last step only; uses SaveButton internals)
```

Internal pieces, not exported initially:

- `WizardProgress` — step indicator (numbered steps or dots, switchable via `progress` prop).
- `WizardToolbar` — Back / Next / Save row that reads step state from `WizardContext`.
- `WizardContext` — `{ currentStep, totalSteps, goNext, goBack, goTo, isFirst, isLast }`.

Each `<WizardForm.Step>` mounts inside a `FormGroupContextProvider name={stepKey}` so
per-step validity is observable via `useFormGroup(stepKey)`. The Next button calls
`form.trigger(stepFieldNames)` to surface errors immediately on click rather than waiting
for the full submit.

## Why all steps stay mounted

Same reason `<TabbedForm>` does it: react-hook-form needs every input registered to
validate the whole form on submit. Unmounting steps would unregister fields and lose
values when navigating Back. Inactive steps are hidden with `display: none` plus
`aria-hidden`.

## Data flow

1. `<WizardForm>` wraps children in `<Form>` from ra-core, which sets up react-hook-form
   with the supplied `defaultValues` / `record` / `validate` / `resolver`.
2. The user edits inputs — react-hook-form tracks state across all steps.
3. **Next** button:
   - Calls `form.trigger(stepFieldNames)` to validate this step.
   - If valid, increments `currentStep`.
   - If `optional={true}`, skips validation.
4. **Back** button: decrements `currentStep` (no validation).
5. **Save** (last step only): triggers full-form submission through `<Form>`'s normal
   submit pipeline. On success, calls `onClose()`. Inside a Create/Edit context, the
   save context handles the dataProvider call; otherwise, `onSubmit` runs.
6. **Cancel**: calls `form.reset()`, then `onClose()`.

## Field-name discovery for `trigger()`

The Next button must know which fields belong to the current step. Strategy:

1. Use `useFormGroup(stepKey)` (from ra-core) as the source of truth. ra-core's form
   group context registers every input rendered under it.
2. If `useFormGroup` exposes the field names (or `getValues` filtered by registered
   inputs), pass those to `form.trigger()`.
3. Fallback if the field-name list isn't accessible: call `form.trigger()` (validate
   everything) — over-validates but is correct. Worst case is showing errors on a step
   the user hasn't reached yet, which the wizard already handles in the submit-error
   path below.

Implementation will probe ra-core's exact API at code time. The fallback is a known-safe
escape hatch.

## Submission errors

When the final submit produces field errors (via `setSubmissionErrors` from ra-core):

1. Inspect which form group each errored field belongs to.
2. Jump to the first step containing an error.
3. Render a destructive alert in `<DialogHeader>` (e.g., "Some fields need attention").

## Integration with `<Create>` / `<Edit>`

- Drop `<WizardForm>` inside `<Create>` or `<Edit>` → `useSaveContext()` is inherited, so
  Save fires `dataProvider.create` / `dataProvider.update` automatically and closes the
  dialog on success.
- Outside that context, `onSubmit` is required. The kit will emit `ra-core`'s standard
  `warning(...)` if neither save context nor `onSubmit` is present.

## i18n

The kit pulls translations from `ra-language-english` via `i18nProvider` (with
`allowMissing: true`), so the wizard cannot ship its own message file. It uses the same
trick `<SaveButton>` and `<CancelButton>` use — pass a translation key with a fallback:

```ts
translate("ra.action.next", { _: "Next" });
translate("ra.action.back", { _: "Back" });
```

If those keys aren't defined upstream, the fallback string is shown. Consumers can
override labels via toolbar customization or, if we expose them, `nextLabel` /
`backLabel` props (deferred until requested).

Step `label` strings are passed through `useTranslate()` if they are strings, matching
`<TabbedForm.Tab>`.

## Accessibility

- Dialog uses radix's `<Dialog>` primitives — focus trap and Escape handling included.
- Progress indicator renders as an `<ol>` with `aria-current="step"` on the active step.
- Inactive step containers carry `aria-hidden="true"` so screen readers ignore them.
- Focus moves to the first input of the new step on Next / Back navigation.
- Toolbar buttons are real `<button>` elements with descriptive `aria-label`s when icons
  are used instead of text.

## Files to add

```
src/components/admin/
  wizard-form.tsx            # <WizardForm>, <WizardForm.Step>, exports
  wizard-form.spec.tsx       # component tests
src/stories/
  wizard-form.stories.tsx    # Basic, ManyStep, OptionalStep, ValidationFailure,
                             # InsideCreate, InsideEdit, CustomToolbar
docs/src/content/docs/
  WizardForm.md              # Usage / Props / per-prop sections
```

Plus updates:

- `src/components/admin/index.ts` — export the new component.

## Testing approach

Following the kit convention: spec files import story exports and render them.

| Test                        | What it verifies                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Basic flow                  | Renders, Next advances, Back retreats, Save submits, dialog closes                   |
| Per-step validation gate    | Invalid required field blocks Next; fixing it allows Next                            |
| Optional step               | Next bypasses validation when `optional` is set                                      |
| Steps stay registered       | Values entered on step 1 persist after navigating to step 3 and back                 |
| Submission errors jump back | Server-side or async validation errors on a prior step force the wizard to that step |
| Inside `<Create>`           | Save calls `dataProvider.create` and closes                                          |
| Cancel resets               | Open, type, cancel, reopen → fields are empty                                        |
| Custom toolbar              | `toolbar` prop replaces default Cancel / Back / Next / Save row                      |
| Keyboard                    | Escape closes; Tab order keeps focus inside the dialog; Enter on Next advances       |

Browser tests run under Vitest + Playwright (kit standard).

## Risks and open questions

- **`useFormGroup` field-name access.** Need to verify at code time whether ra-core
  exposes the list of fields registered under a form group. If not, the fallback is
  validate-all on Next, which is correct but noisier.
- **`<DialogContent>` sizing.** Default radix sizing is `sm:max-w-lg`. Wizards often need
  more vertical room. Will set `className="sm:max-w-2xl"` on the default and allow
  override via the wizard's own `className` prop.
- **Submit while not on last step.** Pressing Enter inside an input on step 1 must not
  submit the form. Wizard will intercept submit and either advance (if not last) or
  submit (if last). Need a test for this.
