import { useState } from "react";
import { PaletteIcon } from "lucide-react";

import { defaultTheme } from "@/components/admin";
import { ThemeStudio } from "@/components/extras/theme-studio";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Header button that opens the ThemeStudio inside a side sheet.
 *
 * The sheet renders the live theme editor against the demo's `defaultTheme`,
 * letting users tweak CSS variables and copy a TypeScript snippet back to
 * source via the built-in Export button.
 */
export const ThemeStudioButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme studio">
          <PaletteIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Theme Studio</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ThemeStudio theme={defaultTheme} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
