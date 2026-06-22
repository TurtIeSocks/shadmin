import { useState } from "react";
import { CheckIcon, StarIcon, TrendingUpIcon } from "lucide-react";

import { Button } from "shadmin/components/ui/button";
import { Badge } from "shadmin/components/ui/badge";
import { Input } from "shadmin/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "shadmin/components/ui/card";

// Theme preset CSS. Each file defines a `.theme-<name>` class that redefines
// the shadcn design tokens (--primary, --secondary, --ring, …). Importing them
// here makes the classes available so the local preview wrapper can swap them.
import "shadmin/styles/themes/aurora.css";
import "shadmin/styles/themes/bw.css";
import "shadmin/styles/themes/house.css";
import "shadmin/styles/themes/nano.css";
import "shadmin/styles/themes/radiant.css";

interface Preset {
  value: string;
  label: string;
  // A representative swatch color (from the preset's --primary) for the
  // selector button dot. Purely cosmetic — the real restyle comes from the
  // applied `.theme-*` class cascading custom properties to the preview.
  swatch: string;
}

// "default" applies no class, so the preview inherits the surrounding
// `.theme-demo` (violet) tokens — the rest each apply `theme-<value>`.
const PRESETS: Preset[] = [
  { value: "default", label: "Default", swatch: "oklch(0.606 0.219 292.7)" },
  { value: "aurora", label: "Aurora", swatch: "oklch(0.52 0.17 286)" },
  { value: "bw", label: "Black & White", swatch: "oklch(0.15 0 0)" },
  { value: "house", label: "House", swatch: "oklch(0.397 0.06 260.5)" },
  { value: "nano", label: "Nano", swatch: "oklch(0.205 0 0)" },
  { value: "radiant", label: "Radiant", swatch: "oklch(0.553 0.245 296)" },
];

/**
 * Themes feature — a live preset switcher. Clicking a preset sets local React
 * state, applied as the className on the preview wrapper below. Each
 * `.theme-<name>` class redefines the shadcn design tokens on that element, so
 * only this panel restyles — the rest of the app keeps its own `.theme-demo`
 * palette. This is exactly how the demo distributes themes: vanilla CSS, no
 * theme-provider, no per-component prop.
 */
export default function ThemesDemo() {
  const [preset, setPreset] = useState("default");
  // "default" => no extra class (inherit .theme-demo); otherwise theme-<value>.
  const themeClass = preset === "default" ? "" : `theme-${preset}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Preset selector — sets local state, never touches <html> */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-muted-foreground">
          Pick a preset — only the preview below restyles
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = preset === p.value;
            return (
              <Button
                key={p.value}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(p.value)}
                className="gap-2"
                aria-pressed={active}
              >
                <span
                  className="size-3 rounded-full border border-black/10"
                  style={{ backgroundColor: p.swatch }}
                />
                {p.label}
                {active ? <CheckIcon className="size-3.5" /> : null}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Preview panel — the className carries the active theme preset, so the
          custom-property cascade restyles everything inside it. */}
      <div className={themeClass}>
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Order #1138
              <Badge>Paid</Badge>
            </CardTitle>
            <CardDescription>
              Sample UI restyled by the{" "}
              <span className="font-medium text-foreground">
                {PRESETS.find((p) => p.value === preset)?.label}
              </span>{" "}
              preset.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* Buttons across variants — exercise --primary, --secondary,
                --destructive, --border, --accent. */}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
              <Button size="sm" variant="destructive">
                Cancel
              </Button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Refunded</Badge>
            </div>

            {/* Input — exercises --input / --ring on focus */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="theme-preview-note"
                className="text-sm font-medium"
              >
                Customer note
              </label>
              <Input
                id="theme-preview-note"
                placeholder="Leave a note for this order…"
              />
            </div>

            {/* A small stat block — exercises --primary + --muted */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUpIcon className="size-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Revenue
                  </span>
                </div>
                <div className="mt-1 text-2xl font-semibold text-primary">
                  $2,480
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <StarIcon className="size-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Rating
                  </span>
                </div>
                <div className="mt-1 text-2xl font-semibold text-primary">
                  4.8
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" size="sm">
              Discard
            </Button>
            <Button size="sm">Save changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
