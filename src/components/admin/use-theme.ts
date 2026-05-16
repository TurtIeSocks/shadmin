import { use } from "react";

import { ThemeProviderContext, type Theme } from "./theme-context";

/**
 * Returns the current theme mode and a setter as a `[mode, setMode]` tuple.
 *
 * Mirrors the upstream `ra-ui-materialui` `useTheme` contract.
 *
 * @example
 * const [mode, setMode] = useTheme();
 */
export const useTheme = (): [Theme, (theme: Theme) => void] => {
  const context = use(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return [context.theme, context.setTheme];
};
