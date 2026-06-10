---
title: "SkipNavigationButton"
---

Accessibility helper that lets keyboard users skip past the page chrome and jump directly to the main content.

## Usage

Place the button as the very first focusable element in your layout. It is visually hidden until it receives keyboard focus, then slides into view in the top-left corner.

```tsx {5}
import { SkipNavigationButton } from "@/components/admin";

const Layout = ({ children }) => (
  <>
    <SkipNavigationButton />
    <header>...</header>
    <main id="main-content">{children}</main>
  </>
);
```

On click (or Enter while focused), the button moves focus to the element with `id="main-content"`. Make sure such an element exists in your layout — otherwise a development-mode console warning is emitted.

## Props

| Prop        | Required | Type     | Default                  | Description        |
| ----------- | -------- | -------- | ------------------------ | ------------------ |
| `className` | Optional | `string` | -                        | Additional classes |
| `label`     | Optional | `string` | `ra.navigation.skip_nav` | i18n key / label   |

## `label`

By default, the label is the translation of the `ra.navigation.skip_nav` key, which reads "Skip to content". Pass a custom string or key to override:

```tsx
<SkipNavigationButton label="Jump to content" />
```
