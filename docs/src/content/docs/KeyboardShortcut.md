---
title: "KeyboardShortcut"
---

Displays a keyboard shortcut using styled `<kbd>` elements. Useful for menus, tooltips, or any UI element that needs to advertise a hotkey to users.

## Usage

Pass the shortcut as a string with `+` separating keys and `>` separating sequential key chords. Common keys are automatically mapped to their symbol equivalents (`mod` and `meta` to `⌘`, `ctrl` to `⌃`, `shift` to `⇧`, etc.).

```tsx
import { KeyboardShortcut } from "@/components/admin/keyboard-shortcut";

const SaveHint = () => (
  <span className="text-sm">
    Save: <KeyboardShortcut keyboardShortcut="mod+s" />
  </span>
);
```

The component renders nothing when `keyboardShortcut` is not provided, making it safe to use conditionally.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `keyboardShortcut` | Optional | `string` | - | Shortcut string (e.g. `"mod+k"`, `"shift+ctrl+a>b"`). Omit to render nothing. |
| `className` | Optional | `string` | - | Extra CSS class names applied to the wrapping element. |

The component also forwards any additional `div` props (e.g. `id`, `role`, `aria-*`) to the wrapping element.

## Key Mapping

| Key | Symbol |
|-----|--------|
| `mod` / `meta` | `⌘` |
| `ctrl` | `⌃` |
| `shift` | `⇧` |
| `alt` | `⌥` |
| `enter` | `⏎` |
| `esc` / `escape` | `⎋` |
| `backspace` | `⌫` |
| `delete` | `⌦` |
| `tab` | `⇥` |
| `space` | `␣` |
| `up` / `down` / `left` / `right` | `↑↓←→` |
| `home` / `end` | `↖↘` |
| `pageup` / `pagedown` | `⇞⇟` |

Any other keys are displayed in uppercase.
