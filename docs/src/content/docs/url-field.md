---
title: "UrlField"
---

Renders a record field as a clickable hyperlink (`<a>`). Prevents row click bubbling in tables.

## Usage

```tsx
import { UrlField } from "@/components/admin";

<UrlField source="website" target="_blank" rel="noopener" />;
```

If the value is missing, renders nothing unless `empty` is provided.

## Props

| Prop           | Required | Type        | Default             | Description               |
| -------------- | -------- | ----------- | ------------------- | ------------------------- |
| `source`       | Required | `string`    | -                   | Field containing the URL  |
| `content`      | Optional | `ReactNode` | URL value           | Custom link text          |
| `defaultValue` | Optional | `any`       | -                   | Fallback when no value    |
| `empty`        | Optional | `ReactNode` | -                   | Placeholder when no value |
| `record`       | Optional | `object`    | Record from context | Explicit record           |

Additional props are passed to the underlying `<a>` element (e.g., `target`, `rel`, `className`).

## `content`

Custom link text rendered inside the `<a>` element. Defaults to the URL value itself, so `<UrlField source="website" />` renders the URL twice (as `href` and as the visible text). Pass a friendlier label — a string, an icon, or any React node — when the raw URL would be ugly or long:

```tsx
<UrlField source="website" content="Visit homepage" />
<UrlField source="docs" content={<><BookOpen className="size-4" /> Docs</>} />
```

## Tips

- Adds `underline` styling by default; override with `className`.
- Clicks call `stopPropagation` so row click handlers aren’t triggered.
