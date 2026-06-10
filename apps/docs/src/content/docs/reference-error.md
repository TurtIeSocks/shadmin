---
title: "ReferenceError"
---

Disabled input used to surface an error from a reference lookup. Shows the label, a disabled input, and the error message below it in the destructive colour.

> **Deprecated.** Prefer the regular error handling of [`<ReferenceInput>`](./reference-input) instead. This component is kept for backward compatibility.

## Usage

```tsx
import { ReferenceError } from "@/components/admin/reference-error";

const BrokenLookup = () => (
  <ReferenceError
    label="Author"
    error={new Error("Failed to load reference 'authors'")}
  />
);
```

## Props

| Prop    | Required | Type        | Default | Description                              |
| ------- | -------- | ----------- | ------- | ---------------------------------------- |
| `error` | Required | `Error`     | -       | Error to display below the input.        |
| `label` | Optional | `ReactNode` | -       | Optional label rendered above the input. |
