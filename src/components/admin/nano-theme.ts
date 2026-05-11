import type { AdminTheme } from "./theme-types";

/**
 * Dense, minimal-chrome theme with pale slate / blue-leaning neutrals.
 *
 * The palette is deliberately quiet — backgrounds sit a hair off-white in light
 * mode and a deep slate in dark mode, with cool gray neutrals throughout. The
 * tight `--radius: 0.125rem` and reduced chroma give views a calm, information-
 * dense feel suited to data-heavy admin screens.
 *
 * Equivalent to the upstream `ra-ui-materialui` `nanoLightTheme` / `nanoDarkTheme`.
 */
export const nanoTheme: AdminTheme = {
  name: "nano",
  label: "Nano",
  light: {
    "--radius": "0.125rem",
    "--background": "oklch(0.985 0.003 240)",
    "--foreground": "oklch(0.2 0.02 240)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.2 0.02 240)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.2 0.02 240)",
    "--primary": "oklch(0.45 0.05 235)",
    "--primary-foreground": "oklch(0.985 0.003 240)",
    "--secondary": "oklch(0.95 0.01 240)",
    "--secondary-foreground": "oklch(0.3 0.04 235)",
    "--muted": "oklch(0.95 0.01 240)",
    "--muted-foreground": "oklch(0.5 0.02 235)",
    "--accent": "oklch(0.92 0.02 235)",
    "--accent-foreground": "oklch(0.3 0.04 235)",
    "--destructive": "oklch(0.52 0.18 27)",
    "--border": "oklch(0.9 0.01 240)",
    "--input": "oklch(0.9 0.01 240)",
    "--ring": "oklch(0.65 0.04 235)",
    "--chart-1": "oklch(0.55 0.1 235)",
    "--chart-2": "oklch(0.6 0.08 200)",
    "--chart-3": "oklch(0.65 0.06 260)",
    "--chart-4": "oklch(0.7 0.05 180)",
    "--chart-5": "oklch(0.5 0.07 220)",
    "--sidebar": "oklch(0.97 0.005 240)",
    "--sidebar-foreground": "oklch(0.2 0.02 240)",
    "--sidebar-primary": "oklch(0.45 0.05 235)",
    "--sidebar-primary-foreground": "oklch(0.985 0.003 240)",
    "--sidebar-accent": "oklch(0.92 0.02 235)",
    "--sidebar-accent-foreground": "oklch(0.3 0.04 235)",
    "--sidebar-border": "oklch(0.9 0.01 240)",
    "--sidebar-ring": "oklch(0.65 0.04 235)",
  },
  dark: {
    "--radius": "0.125rem",
    "--background": "oklch(0.17 0.015 240)",
    "--foreground": "oklch(0.92 0.01 240)",
    "--card": "oklch(0.22 0.02 240)",
    "--card-foreground": "oklch(0.92 0.01 240)",
    "--popover": "oklch(0.22 0.02 240)",
    "--popover-foreground": "oklch(0.92 0.01 240)",
    "--primary": "oklch(0.85 0.03 235)",
    "--primary-foreground": "oklch(0.2 0.02 240)",
    "--secondary": "oklch(0.28 0.02 240)",
    "--secondary-foreground": "oklch(0.92 0.01 240)",
    "--muted": "oklch(0.28 0.02 240)",
    "--muted-foreground": "oklch(0.68 0.02 235)",
    "--accent": "oklch(0.3 0.025 235)",
    "--accent-foreground": "oklch(0.92 0.01 240)",
    "--destructive": "oklch(0.62 0.2 22)",
    "--border": "oklch(1 0 0 / 10%)",
    "--input": "oklch(1 0 0 / 15%)",
    "--ring": "oklch(0.55 0.03 235)",
    "--chart-1": "oklch(0.65 0.1 235)",
    "--chart-2": "oklch(0.7 0.08 200)",
    "--chart-3": "oklch(0.6 0.06 260)",
    "--chart-4": "oklch(0.75 0.05 180)",
    "--chart-5": "oklch(0.55 0.07 220)",
    "--sidebar": "oklch(0.2 0.02 240)",
    "--sidebar-foreground": "oklch(0.92 0.01 240)",
    "--sidebar-primary": "oklch(0.85 0.03 235)",
    "--sidebar-primary-foreground": "oklch(0.2 0.02 240)",
    "--sidebar-accent": "oklch(0.3 0.025 235)",
    "--sidebar-accent-foreground": "oklch(0.92 0.01 240)",
    "--sidebar-border": "oklch(1 0 0 / 10%)",
    "--sidebar-ring": "oklch(0.55 0.03 235)",
  },
};
