import { useEffect, useState } from "react";
import type { editor } from "monaco-editor";

/**
 * When `enabled` is true, returns a height that tracks the editor's
 * content height, clamped to `[minHeight, maxHeight]`. When `enabled`
 * is false, returns 0 (caller should use its own `height`).
 */
export function useAutoHeight(
  instance: editor.IStandaloneCodeEditor | null,
  enabled: boolean,
  minHeight: number,
  maxHeight: number,
): number {
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    if (!instance || !enabled) return;
    const update = () => {
      const next = Math.max(
        minHeight,
        Math.min(maxHeight, instance.getContentHeight()),
      );
      setHeight(next);
      instance.layout();
    };
    update();
    const disposable = instance.onDidContentSizeChange(update);
    return () => disposable.dispose();
  }, [instance, enabled, minHeight, maxHeight]);

  return enabled ? height : 0;
}
