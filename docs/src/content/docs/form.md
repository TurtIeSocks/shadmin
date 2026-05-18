---
title: "Form"
---

Low-level form primitives that wire labels, controls, descriptions, and error messages to [react-hook-form](https://react-hook-form.com/) state. Use these to build custom input components that integrate with shadcn-admin-kit's validation and accessibility model.

Most apps don't import these directly — they're the building blocks behind every `<TextInput>`, `<BooleanInput>`, `<SelectInput>`, etc. Reach for them when you need to build a custom input that doesn't fit any of the shipped ones.

## Usage

```tsx
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormError,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

export const ProfileForm = () => {
  const methods = useForm({ defaultValues: { firstName: "" } });
  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <FormField id="firstName" name="firstName">
          <FormLabel>First name</FormLabel>
          <FormControl>
            <Input {...methods.register("firstName")} />
          </FormControl>
          <FormDescription>As it appears on official documents.</FormDescription>
          <FormError />
        </FormField>
      </form>
    </Form>
  );
};
```

Inside a `<SimpleForm>` (or any ra-core `<Form>`), the surrounding `FormProvider` is already in place — drop `<FormField>` and friends straight in.

## Components

### `<Form>`

Alias for react-hook-form's [`FormProvider`](https://react-hook-form.com/docs/formprovider). Provides the form context that `<FormField>`, `<FormLabel>`, `<FormControl>`, `<FormDescription>`, and `<FormError>` read from.

Skip it when you're already inside a `<SimpleForm>` or any other component that mounts a `FormProvider`.

### `<FormField>`

Wraps a single field. Establishes the local `id` + `name` used by every other primitive in the group to generate matching `htmlFor`, `aria-describedby`, and `aria-invalid` attributes.

| Prop        | Required | Type        | Default | Description                                       |
| ----------- | -------- | ----------- | ------- | ------------------------------------------------- |
| `id`        | Required | `string`    | -       | DOM id assigned to the rendered control.          |
| `name`      | Required | `string`    | -       | react-hook-form field name to subscribe to.       |
| `className` | Optional | `string`    | -       | Extra classes appended to the wrapper `<div>`.    |
| `children`  | Optional | `ReactNode` | -       | Typically a label, control, description, error.  |

The wrapper is rendered as `<div role="group" data-slot="form-item">` with `grid gap-2` spacing.

### `<FormLabel>`

shadcn `<Label>` with `htmlFor` and `data-error` wired automatically. Switches to `text-destructive` whenever the field is invalid.

Accepts any prop supported by Radix's [`Label.Root`](https://www.radix-ui.com/primitives/docs/components/label).

### `<FormControl>`

Radix [`Slot`](https://www.radix-ui.com/primitives/docs/utilities/slot) that forwards `id`, `aria-describedby`, and `aria-invalid` onto its single child. Wrap any control (`<Input>`, `<Switch>`, `<Select>`, a custom component) to get correct ARIA wiring for free.

```tsx
<FormControl>
  <Input {...methods.register("email")} />
</FormControl>
```

### `<FormDescription>`

Renders a `<div data-slot="form-description">` styled as muted helper text. The id matches the `aria-describedby` set by `<FormControl>`, so screen readers announce it together with the control.

### `<FormError>`

Renders the current validation error for the field, or `null` when valid. The id matches the `aria-describedby` set by `<FormControl>` whenever an error is present. The error message is passed through ra-core's [`<ValidationError>`](https://marmelab.com/react-admin/Validation.html) so translation keys and parameters are honored.

## `useFormField`

```ts
import { useFormField } from "@/hooks/use-form-field";
```

Hook that returns the current field's metadata. Use it when building a custom primitive that needs to peek at the wired ids or the validation state.

| Property            | Type             | Description                                                  |
| ------------------- | ---------------- | ------------------------------------------------------------ |
| `formItemId`        | `string`         | The DOM id passed to `<FormField>`.                          |
| `formDescriptionId` | `string`         | `${formItemId}-description`.                                 |
| `formMessageId`     | `string`         | `${formItemId}-message`.                                     |
| `invalid`           | `boolean`        | Mirrors react-hook-form's field state.                       |
| `error`             | `FieldError`     | Current error object, if any.                                |
| `isDirty`           | `boolean`        | Whether the field has changed since the default value.       |
| `isTouched`         | `boolean`        | Whether the field has been blurred at least once.            |

Must be called inside a `<FormField>` and inside a `<Form>` (or any other `FormProvider`).

## Building a custom input

```tsx
import { useInput, FieldTitle } from "ra-core";
import { FormControl, FormError, FormField, FormLabel } from "@/components/admin/form";

export const ColorInput = ({ source, label }: { source: string; label?: string }) => {
  const { id, field, isRequired } = useInput({ source });
  return (
    <FormField id={id} name={field.name}>
      <FormLabel>
        <FieldTitle label={label} source={source} isRequired={isRequired} />
      </FormLabel>
      <FormControl>
        <input type="color" {...field} />
      </FormControl>
      <FormError />
    </FormField>
  );
};
```

The pattern is the same one used by every shipped `*-input.tsx` in `src/components/admin/`.
