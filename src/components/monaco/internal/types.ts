import type { HTMLAttributes, ReactNode } from "react";
import type { InputProps } from "ra-core";
import type { editor } from "monaco-editor";
import type { FieldProps } from "@/lib/field-types";

export type MonacoJsonInputProps = InputProps & {
  schema?: object;
  schemaUri?: string;
  allowComments?: boolean;
  autoHeight?: boolean;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  showFormatButton?: boolean;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;
};

export type MonacoJsonFieldProps = FieldProps & {
  defaultValue?: unknown;
  height?: number | string;
  autoHeight?: boolean;
  maxHeight?: number | string;
  className?: string;
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;
};

export type JsonFieldProps = FieldProps &
  HTMLAttributes<HTMLPreElement> & {
    indent?: number;
    empty?: ReactNode;
  };
