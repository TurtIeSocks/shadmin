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
