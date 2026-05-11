import { useEffect, useMemo, useRef } from "react";
import { useStore } from "ra-core";

import { ThemeProviderContext, type Theme } from "./theme-context";
import { ThemesContext } from "./themes-context";
import type { AdminTheme, ThemeVars } from "./theme-types";

type ThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Initial mode to use when no user preference has been persisted yet.
   *
   * Note: this prop is named `defaultTheme` for backwards compatibility — it
   * configures the *mode* (light/dark/system), not which named theme palette
   * is applied. To pass a palette, use the `theme` / `lightTheme` / `darkTheme`
   * props below.
   */
  defaultTheme?: Theme;
  /**
   * Convenience alias for `lightTheme`. Use this when you only need a single
   * palette (the same theme will be used in both light and dark modes via the
   * theme's own `light` / `dark` variable maps).
   */
  theme?: AdminTheme;
  /**
   * The theme applied in light mode.
   */
  lightTheme?: AdminTheme;
  /**
   * The theme applied in dark mode.
   *
   * Falls back to `lightTheme` if omitted.
   */
  darkTheme?: AdminTheme;
  storageKey?: string;
};

/**
 * Theme provider that manages the active light/dark mode and applies the
 * matching named theme's CSS variables to the document root.
 *
 * Two concerns are layered here:
 *
 * 1. **Mode**: light/dark/system, persisted via ra-core's `useStore`. The mode
 *    is applied as a class (`light`/`dark`) on `<html>` so existing Tailwind
 *    `dark:` variants keep working.
 * 2. **Named theme**: a {@link AdminTheme} object whose CSS variables are
 *    written to `documentElement.style` via `setProperty`. When the active
 *    mode flips, the matching variable map (light or dark) is applied. The set
 *    of keys currently applied is tracked in a ref so they can be cleared on
 *    the next switch (or unmount) to avoid leaking stale overrides.
 *
 * Both pieces of state are exposed via two contexts:
 * - `ThemeProviderContext` for the mode (consumed by `useTheme`)
 * - `ThemesContext` for the named themes (consumed by `useThemesContext`)
 *
 * @internal
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  theme,
  lightTheme,
  darkTheme,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [mode, setMode] = useStore<Theme>(storageKey, defaultTheme);

  // `theme` is a convenience alias for `lightTheme`.
  const resolvedLightTheme = lightTheme ?? theme;
  const resolvedDarkTheme = darkTheme ?? lightTheme ?? theme;

  // Track which CSS variable keys we set last so we can clear them before
  // applying a new palette. Without this, swapping themes (or unmounting)
  // would leave the previous palette's `--*` overrides on `documentElement`.
  const appliedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let effectiveMode: "light" | "dark";
    if (mode === "system") {
      effectiveMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      effectiveMode = mode;
    }

    root.classList.add(effectiveMode);

    // Clear previously-set inline CSS variables before applying new ones.
    for (const key of appliedKeysRef.current) {
      root.style.removeProperty(key);
    }
    appliedKeysRef.current = [];

    // Pick the active palette and the matching variable map for the mode.
    const activeTheme: AdminTheme | undefined =
      effectiveMode === "dark"
        ? (resolvedDarkTheme ?? resolvedLightTheme)
        : (resolvedLightTheme ?? resolvedDarkTheme);

    if (activeTheme) {
      const vars: ThemeVars | undefined =
        effectiveMode === "dark"
          ? (activeTheme.dark ?? activeTheme.light)
          : activeTheme.light;
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          root.style.setProperty(key, value);
        }
        appliedKeysRef.current = Object.keys(vars);
      }

      // Mirror the theme name onto `data-theme` so user CSS can target it.
      root.setAttribute("data-theme", activeTheme.name);
    } else {
      root.removeAttribute("data-theme");
    }
  }, [mode, resolvedLightTheme, resolvedDarkTheme]);

  // Cleanup on unmount: remove inline CSS variables and the data-theme attr.
  useEffect(() => {
    return () => {
      const root = window.document.documentElement;
      for (const key of appliedKeysRef.current) {
        root.style.removeProperty(key);
      }
      appliedKeysRef.current = [];
      root.removeAttribute("data-theme");
    };
  }, []);

  const value = useMemo(
    () => ({
      theme: mode,
      setTheme: setMode,
    }),
    [mode, setMode],
  );

  const themesContextValue = useMemo(
    () => ({
      lightTheme: resolvedLightTheme,
      darkTheme: resolvedDarkTheme,
      defaultTheme,
    }),
    [resolvedLightTheme, resolvedDarkTheme, defaultTheme],
  );

  return (
    <ThemesContext.Provider value={themesContextValue}>
      <ThemeProviderContext.Provider value={value}>
        {children}
      </ThemeProviderContext.Provider>
    </ThemesContext.Provider>
  );
}
