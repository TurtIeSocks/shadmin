import type { AdminTheme } from "./theme-types";

/**
 * Faithful oklch port of upstream `ra-ui-materialui`'s `nanoLightTheme` and
 * `nanoDarkTheme` ("a dense theme with minimal chrome, ideal for complex apps").
 *
 * Light mode uses a deep teal primary (`#00585C`) and a lighter teal
 * secondary (`#64B4B8`); dark mode flips to a near-white primary on a slate
 * `#363D40` background. Corners are flat (`shape.borderRadius: 0`) and alert
 * colors (success `#00745F`, info `#39AEA9`, warning `#F2CB05`, error
 * `#B57185`) match the MUI palette exactly.
 */
const nanoTheme: AdminTheme = {
  name: "nano",
  label: "Nano",
  light: {
    // Upstream: shape.borderRadius: 0 — square corners.
    "--radius": "0",

    // background.default: #f4f4f4, background.paper: #ffffff
    "--background": "oklch(0.962 0 0)",
    "--foreground": "oklch(0.27 0.018 240)", // text.primary: #212b36
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.27 0.018 240)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.27 0.018 240)",

    // primary.main: #00585C (deep teal)
    "--primary": "oklch(0.385 0.044 199)",
    "--primary-foreground": "oklch(0.985 0.002 199)",

    // secondary.main: #64B4B8 (lighter teal)
    "--secondary": "oklch(0.7 0.058 199)",
    "--secondary-foreground": "oklch(0.16 0.018 199)",

    "--muted": "oklch(0.93 0.008 199)",
    "--muted-foreground": "oklch(0.5 0.02 199)",

    // accent surface tracks secondary teal, softened for hover backgrounds.
    "--accent": "oklch(0.93 0.025 199)",
    "--accent-foreground": "oklch(0.385 0.044 199)",

    // alert.error: #B57185
    "--destructive": "oklch(0.585 0.115 358)",

    "--border": "oklch(0.88 0.005 199)",
    "--input": "oklch(0.88 0.005 199)",
    "--ring": "oklch(0.55 0.058 199)",

    // Charts: cycle through the teal-leaning alert palette + primary.
    "--chart-1": "oklch(0.385 0.044 199)", // primary teal
    "--chart-2": "oklch(0.65 0.085 187)", // info #39AEA9
    "--chart-3": "oklch(0.471 0.085 167)", // success #00745F
    "--chart-4": "oklch(0.85 0.165 95)", // warning #F2CB05
    "--chart-5": "oklch(0.585 0.115 358)", // error #B57185

    "--sidebar": "oklch(1 0 0)",
    "--sidebar-foreground": "oklch(0.27 0.018 240)",
    "--sidebar-primary": "oklch(0.385 0.044 199)",
    "--sidebar-primary-foreground": "oklch(0.985 0.002 199)",
    "--sidebar-accent": "oklch(0.93 0.025 199)",
    "--sidebar-accent-foreground": "oklch(0.385 0.044 199)",
    "--sidebar-border": "oklch(0.88 0.005 199)",
    "--sidebar-ring": "oklch(0.55 0.058 199)",
  },
  dark: {
    "--radius": "0",

    // background.default: #363D40 (dark slate)
    "--background": "oklch(0.337 0.008 236)",
    "--foreground": "oklch(0.985 0.001 280)",
    "--card": "oklch(0.4 0.01 236)",
    "--card-foreground": "oklch(0.985 0.001 280)",
    "--popover": "oklch(0.4 0.01 236)",
    "--popover-foreground": "oklch(0.985 0.001 280)",

    // primary.main: #f9fafb (near-white)
    "--primary": "oklch(0.985 0.001 280)",
    "--primary-foreground": "oklch(0.337 0.008 236)",

    // secondary.main: #a0a0a0 (neutral gray)
    "--secondary": "oklch(0.7 0 0)",
    "--secondary-foreground": "oklch(0.18 0.005 236)",

    "--muted": "oklch(0.42 0.008 236)",
    "--muted-foreground": "oklch(0.78 0 0)",

    "--accent": "oklch(0.45 0.04 199)",
    "--accent-foreground": "oklch(0.985 0.001 280)",

    "--destructive": "oklch(0.585 0.115 358)",

    "--border": "oklch(1 0 0 / 12%)",
    "--input": "oklch(1 0 0 / 18%)",
    "--ring": "oklch(0.7 0.058 199)",

    "--chart-1": "oklch(0.7 0.058 199)",
    "--chart-2": "oklch(0.65 0.085 187)",
    "--chart-3": "oklch(0.471 0.085 167)",
    "--chart-4": "oklch(0.85 0.165 95)",
    "--chart-5": "oklch(0.585 0.115 358)",

    "--sidebar": "oklch(0.4 0.01 236)",
    "--sidebar-foreground": "oklch(0.985 0.001 280)",
    "--sidebar-primary": "oklch(0.985 0.001 280)",
    "--sidebar-primary-foreground": "oklch(0.337 0.008 236)",
    "--sidebar-accent": "oklch(0.45 0.04 199)",
    "--sidebar-accent-foreground": "oklch(0.985 0.001 280)",
    "--sidebar-border": "oklch(1 0 0 / 12%)",
    "--sidebar-ring": "oklch(0.7 0.058 199)",
  },
};

export { nanoTheme };
