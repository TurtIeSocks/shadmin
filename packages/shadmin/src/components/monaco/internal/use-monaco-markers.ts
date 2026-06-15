import { useEffect, type MutableRefObject } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

/**
 * Subscribes to marker changes for the given model and writes the
 * latest list into the caller-provided `markersRef`. Calls `onChange`
 * after each update so the caller can re-run validation.
 *
 * The caller owns the ref so callbacks created earlier in render order
 * (e.g., the validate fn passed to `useInput`) can safely close over it.
 *
 * Marker severities: 1=Hint, 2=Info, 4=Warning, 8=Error.
 */
interface UseMonacoMarkersArgs {
  monaco: Monaco | null;
  model: editor.ITextModel | null;
  markersRef: MutableRefObject<editor.IMarker[]>;
  onChange: () => void;
}

function useMonacoMarkers({
  monaco,
  model,
  markersRef,
  onChange,
}: UseMonacoMarkersArgs): void {
  useEffect(() => {
    if (!monaco || !model) return;

    const update = () => {
      markersRef.current = monaco.editor.getModelMarkers({
        resource: model.uri,
      });
      onChange();
    };

    update();
    const disposable = monaco.editor.onDidChangeMarkers((resources) => {
      if (resources.some((r) => r.toString() === model.uri.toString())) {
        update();
      }
    });

    return () => disposable.dispose();
  }, [monaco, model, markersRef, onChange]);
}

export { useMonacoMarkers };
