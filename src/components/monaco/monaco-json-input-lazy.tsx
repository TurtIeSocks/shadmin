import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldTitle, composeValidators, useInput, useResourceContext } from "ra-core";
import { useFormContext } from "react-hook-form";
import Editor, { type Monaco, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

import type { MonacoJsonInputProps } from "./internal/types";
import {
  detectValueShape,
  fromEditorText,
  toEditorText,
  type ValueShape,
} from "./internal/detect-value-shape";
import { useAutoHeight } from "./internal/use-auto-height";
import { useJsonSchema } from "./internal/use-json-schema";
import { useMonacoLayout } from "./internal/use-monaco-layout";
import { useMonacoMarkers } from "./internal/use-monaco-markers";
import { useMonacoTheme } from "./internal/use-monaco-theme";

loader.config({ monaco });

const MonacoJsonInputInner = (props: MonacoJsonInputProps) => {
  const resource = useResourceContext(props);
  const {
    label,
    source,
    helperText,
    className,
    editorClassName,
    schema,
    schemaUri,
    allowComments,
    autoHeight = false,
    height = 300,
    minHeight = 120,
    maxHeight = 600,
    showFormatButton = true,
    readOnly,
    monacoOptions,
    validate,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [monacoApi, setMonacoApi] = useState<Monaco | null>(null);
  const [instance, setInstance] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [model, setModel] = useState<editor.ITextModel | null>(null);

  // Owned by the component so the validate fn (created below, before
  // useMonacoMarkers runs) can safely close over it.
  const markersRef = useRef<editor.IMarker[]>([]);

  const markersValidate = useCallback(() => {
    const errors = markersRef.current.filter((mk) => mk.severity >= 8);
    if (errors.length === 0) return undefined;
    return errors[0].message;
  }, []);

  const composedValidate = useMemo(() => {
    const userValidators = Array.isArray(validate)
      ? validate
      : validate
        ? [validate]
        : [];
    return composeValidators([markersValidate, ...userValidators]);
  }, [markersValidate, validate]);

  const { id, field, isRequired } = useInput({
    ...props,
    validate: composedValidate,
  });

  const { trigger } = useFormContext();

  // Lock value shape on first non-undefined value
  const shapeRef = useRef<ValueShape | null>(null);
  if (shapeRef.current === null) {
    shapeRef.current = detectValueShape(field.value);
  }
  const shape: ValueShape = shapeRef.current ?? "object";

  const editorText = useMemo(
    () => toEditorText(field.value, shape),
    [field.value, shape],
  );

  const modelUri = `inmemory://monaco-json-input/${id}.json`;

  const monacoTheme = useMonacoTheme();
  useMonacoLayout(containerRef, instance);

  const onMarkersChange = useCallback(() => {
    trigger(field.name);
  }, [trigger, field.name]);

  useMonacoMarkers({
    monaco: monacoApi,
    model,
    markersRef,
    onChange: onMarkersChange,
  });

  useJsonSchema({
    monaco: monacoApi,
    modelUri,
    schema,
    schemaUri,
    allowComments,
    enabled: shape === "object",
  });

  const measuredHeight = useAutoHeight(instance, autoHeight, Number(minHeight) || 120, Number(maxHeight) || 600);
  const effectiveHeight = autoHeight ? measuredHeight : height;

  const handleEditorMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, m: Monaco) => {
      setInstance(ed);
      setMonacoApi(m);
      setModel(ed.getModel());
    },
    [],
  );

  const handleEditorChange = useCallback(
    (nextText: string | undefined) => {
      const { value, parseError } = fromEditorText(nextText ?? "", shape);
      if (parseError) return;
      field.onChange(value);
    },
    [field, shape],
  );

  const handleFormat = useCallback(() => {
    instance?.getAction("editor.action.formatDocument")?.run();
  }, [instance]);

  const editorOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      readOnly,
      automaticLayout: false,
      minimap: { enabled: false },
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: "on",
      ...(monacoOptions ?? {}),
    }),
    [readOnly, monacoOptions],
  );

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div
          ref={containerRef}
          className={cn(
            "relative rounded-md border overflow-hidden",
            editorClassName,
          )}
          style={{ height: effectiveHeight || height }}
        >
          {showFormatButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 z-10 h-6 px-2 text-xs"
              onClick={handleFormat}
              aria-label="Format JSON"
            >
              Format
            </Button>
          )}
          <Editor
            height="100%"
            language="json"
            theme={monacoTheme}
            value={editorText}
            path={modelUri}
            options={editorOptions}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export default MonacoJsonInputInner;
