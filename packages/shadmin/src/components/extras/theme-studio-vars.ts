import { useCallback, useEffect, useState } from "react";

import { useResolvedTheme } from "@/hooks/use-theme";

/** Semantic design tokens ThemeStudio exposes for editing. */
export const THEME_TOKENS = [
  "--radius",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

export type ThemeVars = Record<string, string>;

/** Read the current resolved value of each token off `:root`. */
const readVars = (): ThemeVars => {
  if (typeof window === "undefined") return {};
  const cs = getComputedStyle(document.documentElement);
  const out: ThemeVars = {};
  for (const key of THEME_TOKENS) {
    const value = cs.getPropertyValue(key).trim();
    if (value) out[key] = value;
  }
  return out;
};

export interface UseThemeVarsResult {
  /** Editable map for the active mode. */
  vars: ThemeVars;
  /** Set one token: writes inline to `:root` and records the edit. */
  setVar: (key: string, value: string) => void;
  /** Per-mode edited maps, used by the CSS export. */
  light: ThemeVars;
  dark: ThemeVars;
}

/**
 * Self-contained replacement for the old `useThemes` palette context.
 *
 * Seeds the active mode's map from `getComputedStyle` on mount and on every
 * mode flip (only when that mode has no edits yet). Edits are written straight
 * to `document.documentElement.style`, which overrides any active `.theme-*`
 * class, so the preview reflects changes instantly.
 */
export function useThemeVars(): UseThemeVarsResult {
  const mode = useResolvedTheme();
  const [light, setLight] = useState<ThemeVars>({});
  const [dark, setDark] = useState<ThemeVars>({});

  useEffect(() => {
    if (mode === "dark") {
      setDark((cur) => (Object.keys(cur).length ? cur : readVars()));
    } else {
      setLight((cur) => (Object.keys(cur).length ? cur : readVars()));
    }
  }, [mode]);

  const setVar = useCallback(
    (key: string, value: string) => {
      document.documentElement.style.setProperty(key, value);
      if (mode === "dark") setDark((cur) => ({ ...cur, [key]: value }));
      else setLight((cur) => ({ ...cur, [key]: value }));
    },
    [mode],
  );

  const vars = mode === "dark" ? dark : light;
  return { vars, setVar, light, dark };
}
