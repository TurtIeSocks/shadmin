import type { AdminTheme } from "./theme-types";

/**
 * Faithful oklch port of upstream `ra-ui-materialui`'s `radiantLightTheme`
 * and `radiantDarkTheme` ("a theme emphasizing clarity and ease of use,
 * with generous margins and an acid color palette").
 *
 * Both modes share the same vivid violet primary (`#9055fd`). Light mode
 * pairs it with a lighter violet secondary (`#A270FF`); dark mode flips
 * the secondary to hot pink (`#FF83F6`). Alert colors are intentionally
 * acidic: success `#0FBF9F` (teal), info `#3ED0EB` (cyan), warning
 * `#F2E963` (lime), error `#DB488B` (magenta). Border radius is 6px
 * (`shape.borderRadius: 6`).
 */
const radiantTheme: AdminTheme = {
  name: "radiant",
  label: "Radiant",
  light: {
    // Upstream: shape.borderRadius: 6 → 6 / 16 = 0.375rem.
    "--radius": "0.375rem",

    // background.default: #f0f1f6
    "--background": "oklch(0.965 0.005 285)",
    "--foreground": "oklch(0.42 0.018 295)", // text.primary: #544f5a
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.42 0.018 295)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.42 0.018 295)",

    // primary.main: #9055fd (vivid violet)
    "--primary": "oklch(0.553 0.245 296)",
    "--primary-foreground": "oklch(0.985 0.005 296)",

    // secondary.main light: #A270FF (lighter violet)
    "--secondary": "oklch(0.617 0.21 297)",
    "--secondary-foreground": "oklch(0.985 0.005 296)",

    "--muted": "oklch(0.94 0.008 285)",
    "--muted-foreground": "oklch(0.6 0.015 295)", // text.secondary: #89868D

    // accent: cyan info, softened for hover surfaces.
    "--accent": "oklch(0.92 0.06 215)",
    "--accent-foreground": "oklch(0.42 0.018 295)",

    // alert.error: #DB488B (magenta)
    "--destructive": "oklch(0.625 0.198 0.5)",

    "--border": "oklch(0.9 0.01 285)",
    "--input": "oklch(0.9 0.01 285)",
    "--ring": "oklch(0.553 0.245 296)",

    "--chart-1": "oklch(0.553 0.245 296)", // primary violet
    "--chart-2": "oklch(0.72 0.135 175)", // success teal #0FBF9F
    "--chart-3": "oklch(0.79 0.115 215)", // info cyan #3ED0EB
    "--chart-4": "oklch(0.91 0.155 105)", // warning lime #F2E963
    "--chart-5": "oklch(0.625 0.198 0.5)", // error magenta #DB488B

    "--sidebar": "oklch(1 0 0)",
    "--sidebar-foreground": "oklch(0.42 0.018 295)",
    "--sidebar-primary": "oklch(0.553 0.245 296)",
    "--sidebar-primary-foreground": "oklch(0.985 0.005 296)",
    "--sidebar-accent": "oklch(0.92 0.06 215)",
    "--sidebar-accent-foreground": "oklch(0.42 0.018 295)",
    "--sidebar-border": "oklch(0.9 0.01 285)",
    "--sidebar-ring": "oklch(0.553 0.245 296)",
  },
  dark: {
    "--radius": "0.375rem",

    // background.default: #110e1c, background.paper: #151221
    "--background": "oklch(0.13 0.025 285)",
    "--foreground": "oklch(0.95 0.008 285)",
    "--card": "oklch(0.16 0.025 285)",
    "--card-foreground": "oklch(0.95 0.008 285)",
    "--popover": "oklch(0.16 0.025 285)",
    "--popover-foreground": "oklch(0.95 0.008 285)",

    // primary.main: #9055fd (same as light)
    "--primary": "oklch(0.553 0.245 296)",
    "--primary-foreground": "oklch(0.985 0.005 296)",

    // secondary.main dark: #FF83F6 (hot pink)
    "--secondary": "oklch(0.755 0.265 333)",
    "--secondary-foreground": "oklch(0.13 0.025 285)",

    "--muted": "oklch(0.22 0.025 285)",
    "--muted-foreground": "oklch(0.7 0.015 285)",

    "--accent": "oklch(0.4 0.08 215)",
    "--accent-foreground": "oklch(0.95 0.008 285)",

    "--destructive": "oklch(0.625 0.198 0.5)",

    "--border": "oklch(1 0 0 / 12%)",
    "--input": "oklch(1 0 0 / 18%)",
    "--ring": "oklch(0.755 0.265 333)",

    "--chart-1": "oklch(0.553 0.245 296)",
    "--chart-2": "oklch(0.755 0.265 333)",
    "--chart-3": "oklch(0.72 0.135 175)",
    "--chart-4": "oklch(0.79 0.115 215)",
    "--chart-5": "oklch(0.91 0.155 105)",

    "--sidebar": "oklch(0.16 0.025 285)",
    "--sidebar-foreground": "oklch(0.95 0.008 285)",
    "--sidebar-primary": "oklch(0.553 0.245 296)",
    "--sidebar-primary-foreground": "oklch(0.985 0.005 296)",
    "--sidebar-accent": "oklch(0.4 0.08 215)",
    "--sidebar-accent-foreground": "oklch(0.95 0.008 285)",
    "--sidebar-border": "oklch(1 0 0 / 12%)",
    "--sidebar-ring": "oklch(0.755 0.265 333)",
  },
};

export { radiantTheme };
