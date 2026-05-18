import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "ra-core";

import {
  ThemeProviderContext,
  type ResolvedTheme,
  type Theme,
} from "./theme-context";
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

function resolveMode(mode: Theme): ResolvedTheme {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Theme provider that manages the active light/dark mode and applies the
 * matching named theme's CSS variables to the document root.
 *
 * Three concerns are layered here:
 *
 * 1. **Mode**: light/dark/system, persisted via ra-core's `useStore`. The mode
 *    is applied as a class (`light`/`dark`) on `<html>` so existing Tailwind
 *    `dark:` variants keep working.
 * 2. **Named theme**: a {@link AdminTheme} object whose CSS variables seed the
 *    initial live var map. When `theme`/`lightTheme`/`darkTheme` props change,
 *    the live state resyncs.
 * 3. **Live var state**: a mutable per-mode `ThemeVars` map exposed via
 *    {@link ThemesContext}. The reconcile effect writes these vars to
 *    `documentElement.style` whenever they change. Descendants like a theme
 *    editor can call `setLiveVar(key, value)` and the change flows through
 *    React state, so a subsequent mode flip or prop change won't blow it away
 *    until the next explicit resync.
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

  // Live var state per mode. Initialized from props; mutated via `setLiveVar`.
  // Storing each mode separately lets a user edit one mode, flip to the other,
  // and return without losing edits.
  const [liveLight, setLiveLight] = useState<ThemeVars>(
    () => resolvedLightTheme?.light ?? {},
  );
  const [liveDark, setLiveDark] = useState<ThemeVars>(
    () => resolvedDarkTheme?.dark ?? resolvedDarkTheme?.light ?? {},
  );

  // Resync when the caller swaps the theme palette via props.
  useEffect(() => {
    setLiveLight(resolvedLightTheme?.light ?? {});
  }, [resolvedLightTheme]);
  useEffect(() => {
    setLiveDark(resolvedDarkTheme?.dark ?? resolvedDarkTheme?.light ?? {});
  }, [resolvedDarkTheme]);

  const effectiveMode = resolveMode(mode);

  // Track which CSS variable keys we set last so we can clear them before
  // applying a new palette. Without this, swapping themes (or unmounting)
  // would leave the previous palette's `--*` overrides on `documentElement`.
  const appliedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(effectiveMode);

    for (const key of appliedKeysRef.current) {
      root.style.removeProperty(key);
    }
    appliedKeysRef.current = [];

    const vars = effectiveMode === "dark" ? liveDark : liveLight;
    if (vars && Object.keys(vars).length > 0) {
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value);
      }
      appliedKeysRef.current = Object.keys(vars);
    }

    const activeTheme: AdminTheme | undefined =
      effectiveMode === "dark"
        ? (resolvedDarkTheme ?? resolvedLightTheme)
        : (resolvedLightTheme ?? resolvedDarkTheme);
    if (activeTheme) {
      root.setAttribute("data-theme", activeTheme.name);
    } else {
      root.removeAttribute("data-theme");
    }
  }, [
    effectiveMode,
    liveLight,
    liveDark,
    resolvedLightTheme,
    resolvedDarkTheme,
  ]);

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

  const setLiveVar = useCallback(
    (key: string, value: string) => {
      if (effectiveMode === "dark") {
        setLiveDark((cur) => ({ ...cur, [key]: value }));
      } else {
        setLiveLight((cur) => ({ ...cur, [key]: value }));
      }
    },
    [effectiveMode],
  );

  const value = useMemo(
    () => ({
      theme: mode,
      setTheme: setMode,
    }),
    [mode, setMode],
  );

  const liveVars = effectiveMode === "dark" ? liveDark : liveLight;

  const themesContextValue = useMemo(
    () => ({
      lightTheme: resolvedLightTheme,
      darkTheme: resolvedDarkTheme,
      defaultTheme,
      liveVars,
      setLiveVar,
    }),
    [resolvedLightTheme, resolvedDarkTheme, defaultTheme, liveVars, setLiveVar],
  );

  return (
    <ThemesContext.Provider value={themesContextValue}>
      <ThemeProviderContext.Provider value={value}>
        {children}
      </ThemeProviderContext.Provider>
    </ThemesContext.Provider>
  );
}
