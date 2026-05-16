"use client";

import { useEffect, useState } from "react";

import type { AdminTheme, ThemeVars } from "@/components/admin/theme-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLOR_RE = /oklch\(|#[0-9a-f]{3,8}|^rgb|^hsl/i;
const SIZE_RE = /rem|px|%/i;

export interface ThemeStudioProps {
  /** Theme whose `light` variant is edited. */
  theme: AdminTheme;
  /** Restrict the editable list to color or size variables. */
  filter?: "color" | "size";
  /** Whether to render the Export button. Defaults to `true`. */
  showExport?: boolean;
  /** Optional class applied to the outer card. */
  className?: string;
}

/**
 * Live editor for an `AdminTheme`'s CSS custom properties.
 *
 * Each variable in the theme's `light` map becomes an editable text input.
 * On every change, the variable is written directly to
 * `document.documentElement.style` via `setProperty`, so the surrounding UI
 * reflects edits instantly — no rebuild, no reload, no provider re-render.
 *
 * Color-looking values render a swatch preview chip next to the variable name.
 * The Export button copies a TypeScript `AdminTheme` snippet to the clipboard
 * so edits can be pasted back into source.
 *
 * v1 only edits the `light` variant; dark-mode editing is deferred.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, defaultTheme } from "@/components/admin";
 * import { ThemeStudio } from "@/components/extras/theme-studio";
 *
 * <ThemeProvider lightTheme={defaultTheme}>
 *   <ThemeStudio theme={defaultTheme} />
 * </ThemeProvider>;
 * ```
 */
export const ThemeStudio = ({
  theme,
  filter,
  showExport = true,
  className,
}: ThemeStudioProps) => {
  const [vars, setVars] = useState<ThemeVars>(theme.light);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVars(theme.light);
  }, [theme]);

  const entries = Object.entries(vars).filter(([, val]) => {
    if (filter === "color") return COLOR_RE.test(val);
    if (filter === "size") return SIZE_RE.test(val);
    return true;
  });

  const update = (key: string, value: string) => {
    setVars((cur) => ({ ...cur, [key]: value }));
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(key, value);
    }
  };

  const handleExport = async () => {
    const snippet = `export const customTheme: AdminTheme = {
  name: "${theme.name}-custom",
  light: ${JSON.stringify(vars, null, 2)},
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
    <Card
      data-slot="theme-studio"
      className={cn("max-h-[60vh] overflow-y-auto", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Theme Studio</CardTitle>
        {showExport && (
          <Button
            size="sm"
            variant="outline"
            data-theme-export
            onClick={handleExport}
          >
            {copied ? "Copied!" : "Export"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {entries.map(([key, value]) => {
            const isColor = COLOR_RE.test(value);
            return (
              <li
                key={key}
                data-theme-var={key}
                data-value={value}
                className="flex items-center gap-2"
              >
                {isColor ? (
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 shrink-0 rounded border"
                    style={{ backgroundColor: value }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 shrink-0"
                  />
                )}
                <span className="w-44 shrink-0 truncate font-mono text-xs">
                  {key}
                </span>
                <Input
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className="font-mono text-xs"
                  aria-label={key}
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
