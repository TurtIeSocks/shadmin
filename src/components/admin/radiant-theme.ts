import type { AdminTheme } from "./theme-types";

/**
 * Bold, vivid theme — acid violet primary, magenta destructive, cyan/lime charts.
 *
 * Generous `--radius: 0.75rem` softens the impact of saturated hues. Light mode
 * keeps backgrounds near-white so the violet primary remains the focal point;
 * dark mode tints surfaces with a hint of violet for a richer, more atmospheric
 * look.
 *
 * Equivalent to the upstream `ra-ui-materialui` `radiantLightTheme` / `radiantDarkTheme`.
 */
export const radiantTheme: AdminTheme = {
  name: "radiant",
  label: "Radiant",
  light: {
    "--radius": "0.75rem",
    "--background": "oklch(0.99 0.005 300)",
    "--foreground": "oklch(0.2 0.05 290)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.2 0.05 290)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.2 0.05 290)",
    "--primary": "oklch(0.45 0.27 295)",
    "--primary-foreground": "oklch(0.985 0.005 300)",
    "--secondary": "oklch(0.95 0.04 300)",
    "--secondary-foreground": "oklch(0.35 0.18 295)",
    "--muted": "oklch(0.95 0.02 300)",
    "--muted-foreground": "oklch(0.5 0.08 295)",
    "--accent": "oklch(0.85 0.12 195)",
    "--accent-foreground": "oklch(0.2 0.08 220)",
    "--destructive": "oklch(0.55 0.28 0)",
    "--border": "oklch(0.9 0.04 300)",
    "--input": "oklch(0.9 0.04 300)",
    "--ring": "oklch(0.55 0.22 295)",
    "--chart-1": "oklch(0.55 0.27 295)",
    "--chart-2": "oklch(0.75 0.17 175)",
    "--chart-3": "oklch(0.8 0.2 130)",
    "--chart-4": "oklch(0.65 0.25 25)",
    "--chart-5": "oklch(0.68 0.23 340)",
    "--sidebar": "oklch(0.97 0.02 300)",
    "--sidebar-foreground": "oklch(0.2 0.05 290)",
    "--sidebar-primary": "oklch(0.45 0.27 295)",
    "--sidebar-primary-foreground": "oklch(0.985 0.005 300)",
    "--sidebar-accent": "oklch(0.9 0.08 195)",
    "--sidebar-accent-foreground": "oklch(0.2 0.08 220)",
    "--sidebar-border": "oklch(0.9 0.04 300)",
    "--sidebar-ring": "oklch(0.55 0.22 295)",
  },
  dark: {
    "--radius": "0.75rem",
    "--background": "oklch(0.18 0.05 295)",
    "--foreground": "oklch(0.95 0.02 300)",
    "--card": "oklch(0.23 0.06 295)",
    "--card-foreground": "oklch(0.95 0.02 300)",
    "--popover": "oklch(0.23 0.06 295)",
    "--popover-foreground": "oklch(0.95 0.02 300)",
    "--primary": "oklch(0.7 0.25 295)",
    "--primary-foreground": "oklch(0.15 0.05 290)",
    "--secondary": "oklch(0.3 0.08 295)",
    "--secondary-foreground": "oklch(0.95 0.02 300)",
    "--muted": "oklch(0.3 0.05 295)",
    "--muted-foreground": "oklch(0.72 0.05 300)",
    "--accent": "oklch(0.6 0.18 195)",
    "--accent-foreground": "oklch(0.15 0.05 290)",
    "--destructive": "oklch(0.7 0.25 0)",
    "--border": "oklch(1 0 0 / 12%)",
    "--input": "oklch(1 0 0 / 18%)",
    "--ring": "oklch(0.65 0.22 295)",
    "--chart-1": "oklch(0.7 0.27 295)",
    "--chart-2": "oklch(0.7 0.17 175)",
    "--chart-3": "oklch(0.78 0.2 130)",
    "--chart-4": "oklch(0.7 0.25 25)",
    "--chart-5": "oklch(0.73 0.23 340)",
    "--sidebar": "oklch(0.21 0.06 295)",
    "--sidebar-foreground": "oklch(0.95 0.02 300)",
    "--sidebar-primary": "oklch(0.7 0.25 295)",
    "--sidebar-primary-foreground": "oklch(0.15 0.05 290)",
    "--sidebar-accent": "oklch(0.32 0.08 195)",
    "--sidebar-accent-foreground": "oklch(0.95 0.02 300)",
    "--sidebar-border": "oklch(1 0 0 / 12%)",
    "--sidebar-ring": "oklch(0.65 0.22 295)",
  },
};
