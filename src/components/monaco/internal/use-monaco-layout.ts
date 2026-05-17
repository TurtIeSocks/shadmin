import { useEffect, type RefObject } from "react";
import type { editor } from "monaco-editor";

/**
 * Calls `instance.layout()` whenever the container resizes. Without this,
 * Monaco renders at its initial size and doesn't react to container
 * width changes (e.g., sidebar collapses, responsive breakpoints).
 */
export function useMonacoLayout(
  containerRef: RefObject<HTMLElement | null>,
  instance: editor.IStandaloneCodeEditor | null,
) {
  useEffect(() => {
    if (!instance || !containerRef.current) return;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => instance.layout());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, instance]);
}
