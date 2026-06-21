import { type ReactNode, useEffect, useState } from "react";
import { DocsUIContext } from "./docs-ui-context";

export function DocsUIProvider({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("docs-nav-open") === "false") setNavOpen(false);
  }, []);

  const toggleNav = () =>
    setNavOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem("docs-nav-open", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  return (
    <DocsUIContext.Provider value={{ navOpen, toggleNav, sheetOpen, setSheetOpen }}>
      {children}
    </DocsUIContext.Provider>
  );
}
