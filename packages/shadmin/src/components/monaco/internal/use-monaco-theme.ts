import { useEffect, useState } from "react";

/**
 * Returns the active Monaco theme name based on the `<html>` element's
 * class list (the project's `ThemeProvider` toggles `dark` / `light`).
 *
 * Tracks runtime changes via a `MutationObserver` so the editor follows
 * mode switches without a remount.
 */
function useMonacoTheme(): "vs" | "vs-dark" {
  const [theme, setTheme] = useState<"vs" | "vs-dark">(() => readTheme());

  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function readTheme(): "vs" | "vs-dark" {
  if (typeof document === "undefined") return "vs";
  return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
}

export { useMonacoTheme };
