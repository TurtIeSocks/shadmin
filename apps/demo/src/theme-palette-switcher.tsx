import { SwatchBookIcon } from "lucide-react";

import { Button } from "shadmin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "shadmin/components/ui/dropdown-menu";

import { THEME_PALETTES, useThemePalette } from "./use-theme-palette";

/**
 * Demo-only dropdown to switch the active CSS palette at runtime. Applies a
 * `.theme-*` class to `<html>`; the distributed package has no such layer.
 */
export const ThemePaletteSwitcher = () => {
  const [palette, setPalette] = useThemePalette();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme palette">
          <SwatchBookIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_PALETTES.map((p) => (
          <DropdownMenuItem key={p.value} onClick={() => setPalette(p.value)}>
            {p.label}
            {palette === p.value ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
