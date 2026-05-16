---
title: "CronField"
---

Displays a 5-field cron expression as a human-readable phrase via
[`cronstrue`](https://github.com/bradymholt/cronstrue).

## Usage

```tsx
import { CronField } from '@/components/admin';

<CronField source="schedule" />
<CronField source="schedule" showExpression />
<CronField source="schedule" empty="No schedule set" />
```

## Props

| Prop             | Required | Type        | Default | Description |
| ---------------- | -------- | ----------- | ------- | ----------- |
| `source`         | Required | `string`    | -       | Record field to read |
| `showExpression` | Optional | `boolean`   | `false` | Show the raw cron string below the phrase |
| `empty`          | Optional | `ReactNode` | -       | Fallback when value is `null`/empty |
| `className`      | Optional | `string`    | -       | CSS class on `<span>` |

## Storage format

Standard 5-field cron syntax (`min hr dom mon dow`). Quartz/seconds-resolution
is not supported in v1. Invalid expressions render the raw string in muted
monospace.
