import { useCallback, useRef, useState } from "react";
import { useFieldValue } from "shadmin-core";
import Editor, { loader, type Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

import { cn } from "@/lib/utils";
import type { MonacoJsonFieldProps } from "./internal/types";
import { useAutoHeight } from "./internal/use-auto-height";
import { useMonacoLayout } from "./internal/use-monaco-layout";
import { useMonacoTheme } from "./internal/use-monaco-theme";

loader.config({ monaco });

function MonacoJsonFieldInner({
  source,
  record,
  defaultValue,
  height = 200,
  autoHeight = true,
  maxHeight = 400,
  className,
  monacoOptions,
}: MonacoJsonFieldProps) {
  const value = useFieldValue({ defaultValue, source, record });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );

  const text =
    typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2);

  const monacoTheme = useMonacoTheme();
  useMonacoLayout(containerRef, instance);

  const measured = useAutoHeight(
    instance,
    autoHeight,
    40,
    Number(maxHeight) || 400,
  );
  const effectiveHeight = autoHeight ? measured : height;

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, _m: Monaco) => {
      setInstance(ed);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className={cn("rounded-md border overflow-hidden", className)}
      style={{ height: effectiveHeight || height }}
    >
      <Editor
        height="100%"
        language="json"
        theme={monacoTheme}
        value={text}
        options={{
          readOnly: true,
          domReadOnly: true,
          automaticLayout: false,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
          ...(monacoOptions ?? {}),
        }}
        onMount={handleMount}
      />
    </div>
  );
}

export { MonacoJsonFieldInner };
