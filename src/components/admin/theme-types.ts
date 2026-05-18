/**
 * Map of CSS custom property names to their string values.
 *
 * Keys are CSS variable names (with the leading `--`), values are valid CSS
 * values for that property (typically `oklch(...)` color expressions, but any
 * valid CSS string is accepted — e.g. `--radius: 0.5rem`).
 */
type ThemeVars = Record<string, string>;

/**
 * Shape of a named theme accepted by shadcn-admin-kit's `<ThemeProvider>` and `<Admin>`.
 *
 * Each theme is a pair of CSS variable maps applied at runtime to
 * `document.documentElement`. Light variables are applied in light mode, dark
 * variables in dark mode. If `dark` is omitted, the `light` map is used in dark
 * mode too (useful for themes that don't differentiate between modes).
 */
interface AdminTheme {
  /**
   * Stable identifier for the theme.
   *
   * Used for the `data-theme` attribute on the root element and for storage keys.
   */
  name: string;
  /**
   * Optional human-readable label.
   *
   * Useful for theme switchers and admin UIs that surface the theme name.
   */
  label?: string;
  /**
   * CSS variables applied to `:root` in light mode.
   */
  light: ThemeVars;
  /**
   * CSS variables applied to `:root` when `.dark` class is present.
   *
   * If omitted, the `light` map is reused.
   */
  dark?: ThemeVars;
}

export { type ThemeVars, type AdminTheme };
