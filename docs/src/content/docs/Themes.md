---
title: "Themes"
---

Shadcn Admin Kit ships with a small library of named themes — palettes of CSS variables that the `<ThemeProvider>` applies to the document root at runtime. Each theme covers both light and dark modes, and the active palette is a config-time choice: pass it to `<Admin>` once and only the light/dark mode toggles at runtime.

The five built-in themes are:

- **defaultTheme** — the neutral palette shipped in `src/index.css`.
- **bwTheme** — high-contrast monochrome (black & white).
- **nanoTheme** — dense, minimal chrome with cool slate neutrals.
- **radiantTheme** — vivid violet/cyan/lime acid palette with generous radii.
- **houseTheme** — warm orange/coral palette with rounded corners.

## Usage

Pass a theme to `<Admin>` via the `theme` prop:

```tsx
import { Admin, radiantTheme } from "@/components/admin";
import { Resource } from "ra-core";

const App = () => (
  <Admin dataProvider={dataProvider} theme={radiantTheme}>
    <Resource name="posts" list={PostList} />
  </Admin>
);
```

The `theme` prop is a convenience alias for `lightTheme`. The same theme is reused in dark mode (its built-in `dark` variable map is applied). To use **different** themes in light and dark mode, pass `lightTheme` and `darkTheme` separately:

```tsx
import { Admin, nanoTheme, bwTheme } from "@/components/admin";

const App = () => (
  <Admin
    dataProvider={dataProvider}
    lightTheme={nanoTheme}
    darkTheme={bwTheme}
  >
    <Resource name="posts" list={PostList} />
  </Admin>
);
```

If you omit all theme props, your existing `src/index.css` `:root` and `.dark` blocks remain in effect — the inline overrides only kick in when a theme is supplied.

## Available Themes

### `defaultTheme`

The neutral baseline that mirrors `src/index.css` exactly. Choose this (or no theme at all) to preserve the historical visual identity of shadcn-admin-kit.

- **Light**: white background, near-black text and primary.
- **Dark**: near-black background, near-white text.
- **Radius**: `0.625rem`.

```tsx
import { Admin, defaultTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={defaultTheme}>
  ...
</Admin>
```

### `bwTheme`

Pure grayscale, no chroma anywhere in the palette. Charts step down the grayscale ramp.

- **Light**: white surfaces, near-black primary.
- **Dark**: pure black surfaces, white primary.
- **Radius**: `0.25rem` (sharper corners than default).

```tsx
import { Admin, bwTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={bwTheme}>
  ...
</Admin>
```

### `nanoTheme`

Cool, calm, blue-tinted slate palette. Lower chroma and a tight `--radius: 0.125rem` make this suitable for information-dense admin views.

- **Light**: very pale slate-tinted off-white background, deep slate primary.
- **Dark**: rich slate background, near-white primary.
- **Radius**: `0.125rem`.

```tsx
import { Admin, nanoTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={nanoTheme}>
  ...
</Admin>
```

### `radiantTheme`

Bold acid palette — vivid violet primary, cyan accents, magenta destructive, lime chart hues. Large radii soften the saturation.

- **Light**: near-white background, deep violet primary, cyan accent, magenta destructive.
- **Dark**: violet-tinted dark surfaces, bright violet primary.
- **Radius**: `0.75rem`.

```tsx
import { Admin, radiantTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={radiantTheme}>
  ...
</Admin>
```

### `houseTheme`

Warm, joyful palette built around orange and coral, with peachy accents.

- **Light**: warm cream background, vivid orange primary, peachy accent.
- **Dark**: deep cocoa/burgundy surfaces, bright coral primary.
- **Radius**: `1rem`.

```tsx
import { Admin, houseTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={houseTheme}>
  ...
</Admin>
```

## Building a Custom Theme

A theme is a plain TypeScript object that satisfies the `AdminTheme` interface — a `name`, optional `label`, and a `light` (and optional `dark`) map of CSS variable names to values:

```ts
import type { AdminTheme } from "@/components/admin";

export const oceanTheme: AdminTheme = {
  name: "ocean",
  label: "Ocean",
  light: {
    "--radius": "0.5rem",
    "--background": "oklch(0.98 0.02 220)",
    "--foreground": "oklch(0.2 0.05 230)",
    "--primary": "oklch(0.45 0.15 230)",
    "--primary-foreground": "oklch(0.98 0.02 220)",
    // ...the rest of the shadcn CSS variables
  },
  dark: {
    "--radius": "0.5rem",
    "--background": "oklch(0.18 0.04 230)",
    "--foreground": "oklch(0.95 0.02 220)",
    "--primary": "oklch(0.7 0.18 220)",
    "--primary-foreground": "oklch(0.15 0.04 230)",
    // ...
  },
};
```

`ThemeProvider` will write each entry to `documentElement.style` via `setProperty(key, value)` when the matching mode is active, and clean those overrides up when the theme changes or the provider unmounts.

For the full list of variables shadcn-admin-kit understands, see the `:root` and `.dark` blocks in `src/index.css`. The `defaultTheme` export contains every key — copy it as a starting point and adjust values to taste.

