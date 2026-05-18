import { createContext, useContext } from "react";
import type { AdminTheme, ThemeVars } from "./theme-types";

/**
 * Value exposed by `<ThemesContext.Provider>` to descendants.
 */
export interface ThemesContextValue {
  /**
   * The theme applied in light mode.
   */
  lightTheme?: AdminTheme;
  /**
   * The theme applied in dark mode.
   *
   * If omitted, the `lightTheme` (or its `dark` map) is used in dark mode.
   */
  darkTheme?: AdminTheme;
  /**
   * The default mode chosen at app boot when no user preference exists.
   */
  defaultTheme?: "light" | "dark" | "system";
  /**
   * Active live CSS variable map, resolved per current mode.
   *
   * This is the source of truth for what the provider applies to
   * `document.documentElement`. It starts as a copy of the active theme's
   * `light` / `dark` map and can be mutated at runtime via {@link setLiveVar}.
   *
   * Tools like the `<ThemeStudio>` editor read from this map so they always
   * reflect what the user currently sees.
   */
  liveVars: ThemeVars;
  /**
   * Update a single CSS variable on the active mode's live theme.
   *
   * Triggers a provider re-render which re-applies the full var map to
   * `documentElement`. Use this instead of mutating
   * `documentElement.style` directly — direct mutation races with the
   * provider's reconcile effect and gets overwritten on the next mode flip
   * or theme prop change.
   */
  setLiveVar: (key: string, value: string) => void;
}

/**
 * React context that carries the active named themes down the tree.
 * Populated by `<ThemeProvider>` and consumed via {@link useThemes}.
 */
export const ThemesContext = createContext<ThemesContextValue>({
  liveVars: {},
  setLiveVar: () => {},
});

/**
 * Read the active themes context populated by `<ThemeProvider>`.
 *
 * Returns the currently-applied light / dark palettes alongside the live var
 * map and a setter for editing it. Useful for theme editor components or any
 * descendant that wants to introspect or mutate the active palette without
 * touching `documentElement.style` directly.
 */
export function useThemes(): ThemesContextValue {
  return useContext(ThemesContext);
}
