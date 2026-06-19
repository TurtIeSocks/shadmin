---
title: "TimeInput"
---

`<TimeInput>` renders an HTML `<input type="time">` element, allowing users to enter a time of day using the browser's native time picker.

## Usage

```tsx
import { TimeInput } from "@/components/admin";

<TimeInput source="opens_at" />;
```

The appearance of `<TimeInput>` depends on the browser, and falls back to a text input on browsers that do not support `<input type="time">`. The time formatting in this input depends on the user's locale.

The expected form value is a string in the `HH:mm` format (e.g. `'09:30'`). `<TimeInput>` also accepts values that can be converted to a `Date` object (a `Date`, an ISO 8601 string, a Linux timestamp), in which case it extracts the hours and minutes using the browser's timezone.

## Props

| Prop           | Required | Type                                   | Default  | Description                                                                                      |
| -------------- | -------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `source`       | Required | `string`                               | -        | Field name                                                                                       |
| `className`    | Optional | `string`                               | -        | CSS classes                                                                                      |
| `defaultValue` | Optional | `string` &#124; `Date` &#124; `number` | -        | Default value                                                                                    |
| `disabled`     | Optional | `boolean`                              | -        | Disable input                                                                                    |
| `format`       | Optional | `function`                             | -        | Callback taking the value from the form state, and returning the input value                     |
| `helperText`   | Optional | `ReactNode`                            | -        | Help text                                                                                        |
| `label`        | Optional | `string` &#124; `false`                | Inferred | Custom / hide label                                                                              |
| `parse`        | Optional | `(value:string) => string`             | -        | Callback taking the value from the input, and returning the value to be stored in the form state |
| `readOnly`     | Optional | `boolean`                              | -        | If true, the input is read-only                                                                  |
| `validate`     | Optional | `Validator` &#124; `Validator[]`       | -        | Validation                                                                                       |

## `defaultValue`

The `defaultValue` prop can be a `HH:mm` string, a `Date`, or a numeric timestamp:

```tsx
<TimeInput source="opensAt" defaultValue="09:30" />
<TimeInput source="closesAt" defaultValue={new Date()} />
```

## `format` and `parse`

The default `format` converts a `Date` or ISO 8601 string into the `HH:mm` string the HTML input expects. The default `parse` returns the `HH:mm` string as-is.

You can supply custom callbacks if your dataProvider stores time differently:

```tsx
<TimeInput
  source="opensAt"
  format={(value) => /* … */}
  parse={(value) => /* … */}
/>
```

## Internationalization

The time format displayed by the browser cannot be customized — it follows the user's locale.
