import type { AdminTheme } from "./theme-types";

/**
 * Faithful oklch port of upstream `ra-ui-materialui`'s `houseLightTheme` and
 * `houseDarkTheme` ("a young and joyful theme").
 *
 * Light mode pairs a deep navy primary (`#344767`) with a hot-pink secondary
 * (`#f90283`); dark mode flips to a coral primary (`#ec7a77`) on a slate base.
 * Borders are rounded generously (`--radius: 1.25rem`, equivalent to upstream's
 * `shape.borderRadius: 20`), and alert colors (success teal, info cyan, warning
 * olive, error pink) match the MUI palette exactly.
 *
 * Hex → oklch conversions are computed precisely from the upstream source —
 * see the conversion in the project's tooling for reproducibility.
 */
export const houseTheme: AdminTheme = {
  name: "house",
  label: "House",
  light: {
    // Upstream sets shape.borderRadius: 20 (px) — 20 / 16 = 1.25rem
    "--radius": "1.25rem",

    // background.default: #f7f8f9, background.paper: #ffffff
    "--background": "oklch(0.979 0.002 247.8)",
    "--foreground": "oklch(0.22 0.03 260.5)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.22 0.03 260.5)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.22 0.03 260.5)",

    // primary.main: #344767 (deep navy)
    "--primary": "oklch(0.397 0.060 260.5)",
    "--primary-foreground": "oklch(0.979 0.002 247.8)",

    // No explicit MUI "secondary" container colour — derive from the
    // background tinted toward primary for a coherent surface.
    "--secondary": "oklch(0.94 0.012 260)",
    "--secondary-foreground": "oklch(0.397 0.060 260.5)",

    "--muted": "oklch(0.95 0.005 248)",
    "--muted-foreground": "oklch(0.5 0.025 260)",

    // accent surface tracks secondary.main hot-pink (#f90283), softened for
    // hover/badge backgrounds.
    "--accent": "oklch(0.92 0.06 0.5)",
    "--accent-foreground": "oklch(0.4 0.18 0.5)",

    // alert.error: #DB488B
    "--destructive": "oklch(0.625 0.192 356.1)",

    "--border": "oklch(0.9 0.008 248)",
    "--input": "oklch(0.9 0.008 248)",
    "--ring": "oklch(0.491 0.228 300.4)", // primary.light: #7928ca

    // Charts: cycle through the palette so series stay distinct against the
    // navy/pink theme. Order chosen for legibility on white surfaces.
    "--chart-1": "oklch(0.397 0.060 260.5)", // primary navy
    "--chart-2": "oklch(0.491 0.228 300.4)", // primary.light purple
    "--chart-3": "oklch(0.719 0.134 174.7)", // success teal #0FBF9F
    "--chart-4": "oklch(0.793 0.124 213.0)", // info cyan   #3ED0EB
    "--chart-5": "oklch(0.625 0.192 356.1)", // error pink  #DB488B

    "--sidebar": "oklch(1 0 0)",
    "--sidebar-foreground": "oklch(0.22 0.03 260.5)",
    "--sidebar-primary": "oklch(0.397 0.060 260.5)",
    "--sidebar-primary-foreground": "oklch(0.979 0.002 247.8)",
    "--sidebar-accent": "oklch(0.94 0.012 260)",
    "--sidebar-accent-foreground": "oklch(0.397 0.060 260.5)",
    "--sidebar-border": "oklch(0.9 0.008 248)",
    "--sidebar-ring": "oklch(0.491 0.228 300.4)",
  },
  dark: {
    "--radius": "1.25rem",

    // background.default: #363D40, background.paper: #2B3033
    "--background": "oklch(0.355 0.011 225.4)",
    "--foreground": "oklch(0.95 0.01 90)",
    "--card": "oklch(0.305 0.009 234.0)",
    "--card-foreground": "oklch(0.95 0.01 90)",
    "--popover": "oklch(0.305 0.009 234.0)",
    "--popover-foreground": "oklch(0.95 0.01 90)",

    // primary.main dark: #ec7a77 (coral)
    "--primary": "oklch(0.708 0.141 22.8)",
    "--primary-foreground": "oklch(0.305 0.009 234.0)",

    "--secondary": "oklch(0.4 0.02 225)",
    "--secondary-foreground": "oklch(0.95 0.01 90)",

    "--muted": "oklch(0.4 0.015 230)",
    "--muted-foreground": "oklch(0.72 0.015 90)",

    // accent tracks primary.light dark: #fbcf33 (gold), at lower lightness
    // for a hover/badge surface that stays subtle on dark backgrounds.
    "--accent": "oklch(0.45 0.08 90)",
    "--accent-foreground": "oklch(0.95 0.01 90)",

    "--destructive": "oklch(0.625 0.192 356.1)", // shared #DB488B

    "--border": "oklch(1 0 0 / 12%)",
    "--input": "oklch(1 0 0 / 18%)",
    "--ring": "oklch(0.868 0.165 91.8)", // primary.light dark: #fbcf33

    "--chart-1": "oklch(0.708 0.141 22.8)", // primary coral
    "--chart-2": "oklch(0.868 0.165 91.8)", // primary.light gold
    "--chart-3": "oklch(0.719 0.134 174.7)", // success teal
    "--chart-4": "oklch(0.793 0.124 213.0)", // info cyan
    "--chart-5": "oklch(0.625 0.192 356.1)", // error pink

    "--sidebar": "oklch(0.305 0.009 234.0)",
    "--sidebar-foreground": "oklch(0.95 0.01 90)",
    "--sidebar-primary": "oklch(0.708 0.141 22.8)",
    "--sidebar-primary-foreground": "oklch(0.305 0.009 234.0)",
    "--sidebar-accent": "oklch(0.45 0.08 90)",
    "--sidebar-accent-foreground": "oklch(0.95 0.01 90)",
    "--sidebar-border": "oklch(1 0 0 / 12%)",
    "--sidebar-ring": "oklch(0.868 0.165 91.8)",
  },
};
