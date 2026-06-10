import { useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";

interface UseJsonSchemaArgs {
  monaco: Monaco | null;
  modelUri: string;
  schema?: object;
  schemaUri?: string;
  allowComments?: boolean;
  enabled: boolean;
}

/**
 * Registers a JSON Schema for this editor's model via Monaco's global
 * `jsonDefaults`, scoped by `fileMatch: [modelUri]` so it doesn't leak
 * across instances. Removes the entry on unmount or when args change.
 */
function useJsonSchema({
  monaco,
  modelUri,
  schema,
  schemaUri,
  allowComments,
  enabled,
}: UseJsonSchemaArgs) {
  useEffect(() => {
    if (!monaco || !enabled) return;

    const defaults = monaco.languages.json.jsonDefaults;
    const current = defaults.diagnosticsOptions;
    const others = (current.schemas ?? []).filter(
      (s) => !s.fileMatch?.includes(modelUri),
    );
    const next = [...others];

    if (schema) {
      next.push({
        uri: `inline://${modelUri}`,
        fileMatch: [modelUri],
        schema,
      });
    } else if (schemaUri) {
      next.push({ uri: schemaUri, fileMatch: [modelUri] });
    }

    defaults.setDiagnosticsOptions({
      validate: true,
      allowComments: !!allowComments,
      trailingCommas: allowComments ? "ignore" : "error",
      schemas: next,
    });

    return () => {
      const after = defaults.diagnosticsOptions;
      const remaining = (after.schemas ?? []).filter(
        (s) => !s.fileMatch?.includes(modelUri),
      );
      defaults.setDiagnosticsOptions({
        ...after,
        schemas: remaining,
      });
    };
  }, [monaco, modelUri, schema, schemaUri, allowComments, enabled]);
}

export { useJsonSchema };
