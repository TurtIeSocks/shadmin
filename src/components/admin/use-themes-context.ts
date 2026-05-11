import { useContext } from "react";

import { ThemesContext, type ThemesContextValue } from "./themes-context";
import type { AdminTheme } from "./theme-types";

/**
 * Parameters accepted by {@link useThemesContext}.
 *
 * Each field acts as an override: if provided, it takes precedence over the
 * matching value pulled from the surrounding `<ThemesContext>`.
 */
export interface UseThemesContextParams {
  lightTheme?: AdminTheme;
  darkTheme?: AdminTheme;
  defaultTheme?: "light" | "dark" | "system";
}

/**
 * Read the active named themes from context, with optional overrides.
 *
 * The merge rule mirrors the upstream `ra-ui-materialui` hook: a value passed
 * via `params` wins over the value from `<ThemesContext>`, and `undefined`
 * params fall through to the context value. This lets a component accept
 * its own `lightTheme` / `darkTheme` props while still defaulting to whatever
 * the surrounding `<Admin>` configured.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/themes Themes documentation}
 *
 * @example
 * const { lightTheme, darkTheme } = useThemesContext();
 *
 * @example
 * // Override the dark theme locally while inheriting the light theme.
 * const { lightTheme, darkTheme } = useThemesContext({ darkTheme: myDarkTheme });
 */
export const useThemesContext = (
  params?: UseThemesContextParams,
): ThemesContextValue => {
  const { lightTheme, darkTheme, defaultTheme } = params || {};
  const context = useContext(ThemesContext);
  return {
    lightTheme: lightTheme ?? context.lightTheme,
    darkTheme: darkTheme ?? context.darkTheme,
    defaultTheme: defaultTheme ?? context.defaultTheme,
  };
};
