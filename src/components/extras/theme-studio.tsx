"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ThemeModeToggle } from "../admin";
import { useResolvedTheme } from "@/hooks/use-theme";
import { useThemes } from "../admin/themes-context";
import { Separator } from "../ui/separator";
import { ColorPicker } from "../ui/color-picker";

const CSS_UNITS = [
  "%",
  "cap",
  "ch",
  "cm",
  "cqb",
  "cqh",
  "cqi",
  "cqmax",
  "cqmin",
  "cqw",
  "deg",
  "dpcm",
  "dpi",
  "dppx",
  "dvb",
  "dvh",
  "dvi",
  "dvmax",
  "dvmin",
  "dvw",
  "em",
  "ex",
  "fr",
  "grad",
  "Hz",
  "ic",
  "in",
  "kHz",
  "lh",
  "lvb",
  "lvh",
  "lvi",
  "lvmax",
  "lvmin",
  "lvw",
  "mm",
  "ms",
  "pc",
  "pt",
  "px",
  "Q",
  "rad",
  "rcap",
  "rch",
  "rem",
  "rex",
  "ric",
  "rlh",
  "s",
  "svb",
  "svh",
  "svi",
  "svmax",
  "svmin",
  "svw",
  "turn",
  "vb",
  "vh",
  "vi",
  "vmax",
  "vmin",
  "vw",
  "x",
];

const CSS_WIDE_KEYWORDS = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const UNIT_RE_PART = CSS_UNITS.slice()
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const CSS_NUMBER_RE_PART = String.raw`[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?`;

const MEASUREMENT_RE = new RegExp(
  String.raw`^(${CSS_NUMBER_RE_PART})\s*(${UNIT_RE_PART})$`,
  "i",
);

interface ThemeStudioProps {
  /** Whether to render the Export button. Defaults to `true`. */
  showExport?: boolean;
  /** Whether to render the ThemeModeToggle button. Defaults to `true`. */
  showThemeModeToggle?: boolean;
  /** Optional class applied to the outer card. */
  className?: string;
}

/**
 * Live editor for the active `AdminTheme`'s CSS custom properties.
 *
 * Edits are routed through `<ThemeProvider>`'s live var state via the
 * `setLiveVar` setter on `ThemesContext`. The provider's reconcile effect
 * writes the resulting var map to `document.documentElement`, so the
 * surrounding UI reflects edits instantly — no rebuild, no reload, no race
 * with the provider's own DOM writes.
 *
 * Color rows mount a `<ColorPicker>` keyed by the variable name; measurement
 * rows expose a numeric input plus a unit select. The Export button copies a
 * TypeScript `AdminTheme` snippet to the clipboard so edits can be pasted
 * back into source.
 *
 * Requires a surrounding `<ThemeProvider>` — without one, there is no live var
 * map to edit.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, defaultTheme } from "@/components/admin";
 * import { ThemeStudio } from "@/components/extras/theme-studio";
 *
 * <ThemeProvider theme={defaultTheme}>
 *   <ThemeStudio />
 * </ThemeProvider>;
 * ```
 */
const ThemeStudio = ({
  showExport = true,
  showThemeModeToggle = true,
  className,
}: ThemeStudioProps) => {
  const { liveVars, setLiveVar, lightTheme, darkTheme } = useThemes();

  const { colors, measurements } = useMemo(() => {
    const values = Object.entries(liveVars).reduce(
      (acc, [name, value]) => {
        if (isCssColor(value)) {
          acc.colors.push([name, value]);
        } else {
          acc.measurements.push([name, value]);
        }
        return acc;
      },
      { colors: [], measurements: [] } as {
        colors: [string, string][];
        measurements: [string, string][];
      },
    );
    values.colors.sort(([a], [b]) => a.localeCompare(b));
    values.measurements.sort(([a], [b]) => a.localeCompare(b));

    return values;
  }, [liveVars]);

  return (
    <Card
      data-slot="theme-studio"
      className={cn("max-h-[60vh] overflow-y-auto", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm grow">Theme Studio</CardTitle>
        {showThemeModeToggle && <ThemeModeToggle />}
        {showExport && (
          <ThemeExport
            liveVars={liveVars}
            lightTheme={lightTheme}
            darkTheme={darkTheme}
          />
        )}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {measurements.map(([name, value]) => (
            <MeasurementInput
              key={name}
              name={name}
              value={value}
              update={setLiveVar}
            />
          ))}
          <Separator className="my-4" />
          {colors.map(([name, value]) => (
            <ColorInput
              key={name}
              name={name}
              value={value}
              update={setLiveVar}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

interface CssInputProps {
  name: string;
  value: string;
  update: (name: string, next: string) => void;
}

function CssVarLabel({ children }: React.PropsWithChildren) {
  return (
    <span className="w-44 shrink-0 truncate font-mono text-xs">{children}</span>
  );
}

function ColorInput({ name, value, update }: CssInputProps) {
  return (
    <li
      data-theme-var={name}
      data-value={value}
      className="flex items-center gap-2"
    >
      <ColorPicker
        value={value}
        onChange={(next) => update(name, next)}
        aria-label={`Open color picker for ${name}`}
      />
      <CssVarLabel>{name}</CssVarLabel>
      <Input
        value={value}
        type="text"
        onChange={(e) => update(name, e.target.value)}
        className="font-mono text-xs"
        aria-label={name}
      />
    </li>
  );
}

function MeasurementInput({ name, value, update }: CssInputProps) {
  const parsed = parseMeasurement(value);
  const num = parsed?.[0] ?? "";
  const unit = parsed?.[1] ?? "";

  return (
    <li
      data-theme-var={name}
      data-value={value}
      className="flex items-center gap-2"
    >
      <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0" />
      <CssVarLabel>{name}</CssVarLabel>
      <Input
        value={num}
        type="number"
        step={0.1}
        onChange={(e) => update(name, `${e.target.value}${unit}`)}
        className="font-mono text-xs"
        aria-label={name}
      />
      <Select value={unit} onValueChange={(u) => update(name, `${num}${u}`)}>
        <SelectTrigger className="h-8 w-fit">
          <SelectValue placeholder={unit} />
        </SelectTrigger>
        <SelectContent side="top">
          {CSS_UNITS.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </li>
  );
}

function ThemeExport({
  lightTheme,
  darkTheme,
  liveVars,
}: Pick<
  ReturnType<typeof useThemes>,
  "darkTheme" | "lightTheme" | "liveVars"
>) {
  const [copied, setCopied] = useState(false);
  const mode = useResolvedTheme();

  const handleExport = async () => {
    const activeTheme = mode === "dark" ? darkTheme : lightTheme;
    const name = activeTheme?.name ?? "custom";
    const snippet = `export const customTheme: AdminTheme = {
  name: ${JSON.stringify(name)},
  ${mode}: ${JSON.stringify(liveVars, null, 2)},
};`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard write can fail in some environments — swallow silently. */
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      data-theme-export
      onClick={handleExport}
    >
      {copied ? "Copied!" : "Export"}
    </Button>
  );
}

function isCssColor(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || CSS_WIDE_KEYWORDS.has(trimmed.toLowerCase())) {
    return false;
  }

  if (/^var\(/i.test(trimmed)) {
    return false;
  }

  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", trimmed);
  }

  return /^(?:#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|device-cmyk|color-mix)\(|transparent|currentColor\b)/i.test(
    trimmed,
  );
}

function parseMeasurement(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(MEASUREMENT_RE);

  if (!match) {
    return null;
  }

  return [match[1], match[2]] as const;
}

export { type ThemeStudioProps, ThemeStudio };
