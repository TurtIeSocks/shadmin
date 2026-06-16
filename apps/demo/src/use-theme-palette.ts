import { useEffect } from "react";
import { useStore } from "ra-core";

export const THEME_PALETTES = [
  { value: "default", label: "Default" },
  { value: "aurora", label: "Aurora" },
  { value: "bw", label: "Black & White" },
  { value: "house", label: "House" },
  { value: "nano", label: "Nano" },
  { value: "radiant", label: "Radiant" },
] as const;

export type ThemePalette = (typeof THEME_PALETTES)[number]["value"];

const CLASS_NAMES = THEME_PALETTES.filter((p) => p.value !== "default").map(
  (p) => `theme-${p.value}`,
);

const applyPalette = (palette: ThemePalette) => {
  const root = document.documentElement;
  root.classList.remove(...CLASS_NAMES);
  if (palette !== "default") root.classList.add(`theme-${palette}`);
};

/**
 * Demo-only runtime palette switcher. Persists the choice via ra-core
 * `useStore` and applies the matching `.theme-*` class to `<html>`. Defaults to
 * aurora so the demo showcases the aurora palette on first load.
 */
export const useThemePalette = (): [
  ThemePalette,
  (palette: ThemePalette) => void,
] => {
  const [palette, setPalette] = useStore<ThemePalette>(
    "demo.palette",
    "aurora",
  );
  useEffect(() => {
    applyPalette(palette);
  }, [palette]);
  return [palette, setPalette];
};
