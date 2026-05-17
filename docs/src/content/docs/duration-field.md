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
