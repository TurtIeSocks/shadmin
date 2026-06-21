import { createContext, useContext } from "react";

// Shared docs-chrome state so the global nav can drive the docs-layout sidebar
// (one header row instead of a separate utility bar).
export interface DocsUI {
  navOpen: boolean; // desktop sidebar expanded
  toggleNav: () => void;
  sheetOpen: boolean; // mobile nav sheet
  setSheetOpen: (open: boolean) => void;
}

export const DocsUIContext = createContext<DocsUI | null>(null);

export function useDocsUI(): DocsUI {
  const ctx = useContext(DocsUIContext);
  if (!ctx) throw new Error("useDocsUI must be used within DocsUIProvider");
  return ctx;
}
