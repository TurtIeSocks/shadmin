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
