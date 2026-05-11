---
title: "Placeholder"
---

Tiny placeholder block used while data is loading. Renders an inline-flex `<span>` filled with the muted background colour so a row of fields keeps its height during a fetch.

## Usage

```tsx
import { Placeholder } from "@/components/admin/placeholder";

const LoadingField = () => <Placeholder className="w-24" />;
```

The component ships with a single non-breaking space as default child to give it a baseline height. Pass `children` to render your own content inside the muted block instead.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `children` | Optional | `ReactNode` | `" "` (nbsp) | Optional content inside the placeholder. |
| `className` | Optional | `string` | - | Extra CSS class applied to the wrapping span. |
