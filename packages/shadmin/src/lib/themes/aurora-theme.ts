import type { AdminTheme } from "./theme-types";

/**
 * Aurora theme — a violet-led admin palette inspired by the aurora borealis
 * gradient (magenta → violet → cyan). Light mode uses a cool near-white base
 * with a deep violet primary; dark mode lifts to an aubergine-ink background
 * with a brighter violet primary. All foreground/background pairings are
 * chosen for WCAG AA contrast in a real admin UI.
 */
const auroraTheme: AdminTheme = {
  name: "aurora",
  label: "Aurora",
  light: {
    "--radius": "0.625rem",

    "--background": "oklch(0.99 0.004 290)",
    "--foreground": "oklch(0.18 0.02 285)",

    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.18 0.02 285)",

    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.18 0.02 285)",

    // Deep violet — enough chroma for white text to pass contrast
    "--primary": "oklch(0.52 0.17 286)",
    "--primary-foreground": "oklch(0.985 0.005 290)",

    "--secondary": "oklch(0.96 0.01 290)",
    "--secondary-foreground": "oklch(0.28 0.05 286)",

    "--muted": "oklch(0.96 0.01 290)",
    "--muted-foreground": "oklch(0.55 0.03 286)",

    "--accent": "oklch(0.96 0.01 290)",
    "--accent-foreground": "oklch(0.28 0.05 286)",

    "--destructive": "oklch(0.58 0.22 27)",

    "--border": "oklch(0.92 0.012 290)",
    "--input": "oklch(0.92 0.012 290)",
    "--ring": "oklch(0.52 0.17 286)",

    // Aurora spectrum: magenta, violet, teal/cyan, blue, pink
    "--chart-1": "oklch(0.62 0.20 1)",
    "--chart-2": "oklch(0.58 0.17 286)",
    "--chart-3": "oklch(0.70 0.13 180)",
    "--chart-4": "oklch(0.62 0.15 250)",
    "--chart-5": "oklch(0.70 0.16 350)",

    "--sidebar": "oklch(0.98 0.006 290)",
    "--sidebar-foreground": "oklch(0.18 0.02 285)",
    "--sidebar-primary": "oklch(0.52 0.17 286)",
    "--sidebar-primary-foreground": "oklch(0.985 0.005 290)",
    "--sidebar-accent": "oklch(0.96 0.01 290)",
    "--sidebar-accent-foreground": "oklch(0.28 0.05 286)",
    "--sidebar-border": "oklch(0.92 0.012 290)",
    "--sidebar-ring": "oklch(0.52 0.17 286)",
  },
  dark: {
    "--radius": "0.625rem",

    // Aubergine-ink — not pure black, readable dark admin surface
    "--background": "oklch(0.16 0.015 285)",
    "--foreground": "oklch(0.96 0.01 290)",

    "--card": "oklch(0.20 0.018 285)",
    "--card-foreground": "oklch(0.96 0.01 290)",

    "--popover": "oklch(0.20 0.018 285)",
    "--popover-foreground": "oklch(0.96 0.01 290)",

    // Brighter violet for dark mode — dark foreground to keep contrast
    "--primary": "oklch(0.70 0.15 286)",
    "--primary-foreground": "oklch(0.18 0.02 285)",

    "--secondary": "oklch(0.26 0.02 286)",
    "--secondary-foreground": "oklch(0.96 0.01 290)",

    "--muted": "oklch(0.26 0.02 286)",
    "--muted-foreground": "oklch(0.71 0.03 286)",

    "--accent": "oklch(0.26 0.02 286)",
    "--accent-foreground": "oklch(0.96 0.01 290)",

    "--destructive": "oklch(0.70 0.19 22)",

    "--border": "oklch(1 0 0 / 10%)",
    "--input": "oklch(1 0 0 / 15%)",
    "--ring": "oklch(0.70 0.15 286)",

    // Brighter aurora spectrum for dark backgrounds
    "--chart-1": "oklch(0.72 0.22 1)",
    "--chart-2": "oklch(0.70 0.15 286)",
    "--chart-3": "oklch(0.76 0.15 180)",
    "--chart-4": "oklch(0.70 0.17 250)",
    "--chart-5": "oklch(0.78 0.18 350)",

    "--sidebar": "oklch(0.18 0.02 285)",
    "--sidebar-foreground": "oklch(0.96 0.01 290)",
    "--sidebar-primary": "oklch(0.70 0.15 286)",
    "--sidebar-primary-foreground": "oklch(0.18 0.02 285)",
    "--sidebar-accent": "oklch(0.26 0.02 286)",
    "--sidebar-accent-foreground": "oklch(0.96 0.01 290)",
    "--sidebar-border": "oklch(1 0 0 / 10%)",
    "--sidebar-ring": "oklch(0.70 0.15 286)",
  },
};

export { auroraTheme };
