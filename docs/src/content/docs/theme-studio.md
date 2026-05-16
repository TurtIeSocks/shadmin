---
title: "ThemeStudio"
---

Live editor for an `AdminTheme`'s CSS custom properties. Updates
`document.documentElement` directly so changes are visible instantly.

## Usage

```tsx
import { ThemeProvider, defaultTheme } from "@/components/admin";
import { ThemeStudio } from "@/components/extras/theme-studio";

<ThemeProvider lightTheme={defaultTheme}>
  <ThemeStudio theme={defaultTheme} />
</ThemeProvider>;
```

Each variable in the theme's `light` map renders as a text input. Editing a
value writes the new value to `document.documentElement.style` via
`setProperty`, so the surrounding admin UI updates immediately — no rebuild,
no reload. Values that look like a color (e.g. `oklch(...)`, `#aabbcc`,
`rgb(...)`, `hsl(...)`) get a swatch preview chip next to the variable name.

## Props

| Prop         | Required | Type                | Default | Description                            |
| ------------ | -------- | ------------------- | ------- | -------------------------------------- |
| `theme`      | Required | `AdminTheme`        | -       | Theme whose `light` variant is edited. |
| `filter`     | Optional | `"color" \| "size"` | -       | Narrows the editable variable list.    |
| `showExport` | Optional | `boolean`           | `true`  | Whether to render the Export button.   |
| `className`  | Optional | `string`            | -       | CSS class applied to the outer card.   |

## `theme`

The `AdminTheme` whose `light` variant is exposed for editing. The component
reads `theme.light` to populate the initial variable list, and resets to
`theme.light` if the prop reference changes.

```tsx
<ThemeStudio theme={defaultTheme} />
```

## `filter`

Narrows the editable list to color or size variables:

- `"color"` keeps variables whose value matches `oklch(...)`, `#rgb`,
  `rgb(...)`, or `hsl(...)`.
- `"size"` keeps variables whose value contains `rem`, `px`, or `%`.

```tsx
<ThemeStudio theme={defaultTheme} filter="color" />
```

## `showExport`

Toggles the Export button (default `true`). Set to `false` to hide it
entirely — useful when the studio is embedded in a settings panel that has
its own save flow.

```tsx
<ThemeStudio theme={defaultTheme} showExport={false} />
```

## `className`

Custom class applied to the outer `Card`. Combine with `cn` to tweak the
default `max-h-[60vh] overflow-y-auto`.

```tsx
<ThemeStudio theme={defaultTheme} className="max-h-[80vh]" />
```

## Export

The Export button copies a TypeScript `AdminTheme` snippet to the clipboard
via `navigator.clipboard.writeText`. The snippet derives `name` from
`theme.name` with a `-custom` suffix so the result can be pasted alongside
the original theme without colliding on identity.

Edits are not persisted by the component — reload reverts to the original
theme's values. Persistence is the caller's responsibility (typical pattern:
copy the exported snippet into a theme module, then ship the updated theme).

## Limitations

- v1 edits only the `light` variant. Dark-mode editing is deferred.
- No undo/redo — live edits stack on `document.documentElement.style`.
- No persistence — reload reverts to the original theme.
