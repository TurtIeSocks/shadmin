import { useState } from "react";
import { LayoutIcon, PaletteIcon } from "lucide-react";

import { defaultTheme } from "@/components/admin";
import { LayoutBuilder } from "@/components/extras/layout-builder";
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

/**
 * Header button that opens the LayoutBuilder inside a side sheet.
 *
 * The drawer is global (no resource context), so it targets the demo's
 * `products` list as a representative example. The builder persists column
 * order via `useStore`, so consumers can read it back into `<DataTable
 * storeKey>`. No `onExport` callback exists — the spec's suggested
 * `localStorage.setItem("demo:layout", ...)` is satisfied by the built-in
 * store persistence.
 */
const PRODUCT_LAYOUT_FIELDS = [
  "reference",
  "category_id",
  "price",
  "stock",
  "sales",
] as const;

export const LayoutBuilderButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Layout builder">
          <LayoutIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Layout Builder</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <LayoutBuilder
            resource="products"
            availableFields={PRODUCT_LAYOUT_FIELDS}
            mode="list-columns"
            className="w-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
