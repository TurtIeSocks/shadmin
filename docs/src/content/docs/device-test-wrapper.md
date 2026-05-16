---
title: "DeviceTestWrapper"
---

Test utility that simulates a fixed device width by overriding `window.matchMedia` and constraining its children to that pixel width. Useful for Storybook and SSR-style tests to verify responsive layouts without resizing the actual viewport.

## Usage

```tsx
import { DeviceTestWrapper } from "@/components/admin/device-test-wrapper";

const SmallScreenPreview = () => (
  <DeviceTestWrapper width="sm">
    <MyResponsiveComponent />
  </DeviceTestWrapper>
);
```

The `width` prop accepts a breakpoint keyword (`xs`, `sm`, `md`, `lg`, `xl`) which maps to a fixed pixel width. The wrapper:

1. Overrides `window.matchMedia` so calls inside the children receive `matches: true/false` based on the simulated width (supports `(min-width: …px)` and `(max-width: …px)` queries).
2. Sets the wrapping `<div>` to the same pixel width.

The original `matchMedia` is restored when the component unmounts.

## Width Map

| Breakpoint | Pixels |
| ---------- | ------ |
| `xs`       | `0`    |
| `sm`       | `600`  |
| `md`       | `900`  |
| `lg`       | `1200` |
| `xl`       | `1536` |

## Props

| Prop       | Required | Type                                   | Default | Description                                      |
| ---------- | -------- | -------------------------------------- | ------- | ------------------------------------------------ |
| `width`    | Required | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | -       | Breakpoint keyword to simulate.                  |
| `children` | Required | `ReactNode`                            | -       | Content to render inside the simulated viewport. |

## Caveat

This component patches `window.matchMedia` globally for the lifetime of the wrapper, so it should not be nested or rendered concurrently with other code that also depends on `matchMedia`. Use it for isolated test scenarios, not production layouts.
