import { createContext } from "react";
import type { AdminTheme } from "./theme-types";

/**
 * Value exposed by `<ThemesContext.Provider>` to descendants.
 *
 * Mirrors the upstream `ra-ui-materialui` `ThemesContextValue` shape so that
 * existing patterns (e.g. `useThemesContext`) translate directly.
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
}

/**
 * React context that carries the active named themes down the tree.
 *
 * Populated by `<ThemeProvider>` and read via `useThemesContext`. Defaults to
 * an empty object so consumers can call the hook without a provider in tests.
 */
export const ThemesContext = createContext<ThemesContextValue>({});
