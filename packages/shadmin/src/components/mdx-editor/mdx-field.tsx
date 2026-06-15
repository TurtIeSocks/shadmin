import * as React from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import { useFieldValue, useTranslate } from "ra-core";

import { useTheme } from "@/hooks/use-theme";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { cn } from "@/lib/utils";
import { defaultFieldPlugins } from "./default-plugins";
import "./mdx-editor-dark.css";

interface MdxFieldProps<RecordType extends UnknownRecord = UnknownRecord>
  extends FieldProps<RecordType>,
    Omit<MDXEditorProps, "markdown" | "readOnly" | "ref"> {
  /**
   * @deprecated Use the `empty` prop instead.
   */
  emptyText?: string;
}

/**
 * Renders a markdown string from a record as read-only rich content using
 * MDXEditor. Use this in `Show` views to display markdown stored by `MdxInput`.
 *
 * @example
 * import { Show, RecordField } from '@/components/admin';
 * import { MdxField } from '@/components/mdx-editor';
 * import '@mdxeditor/editor/style.css';
 *
 * const PostShow = () => (
 *   <Show>
 *     <RecordField source="body">
 *       <MdxField source="body" />
 *     </RecordField>
 *   </Show>
 * );
 */
const MdxField = <RecordType extends UnknownRecord = UnknownRecord>(
  props: MdxFieldProps<RecordType>,
) => {
  const {
    empty,
    emptyText,
    source,
    record,
    plugins = defaultFieldPlugins,
    className,
    ...rest
  } = props;
  const ref = React.useRef<MDXEditorMethods>(null);
  const translate = useTranslate();
  const value = useFieldValue({ source, record });

  const [theme] = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const fallback = empty ?? emptyText;
  const markdown: string =
    value != null && value !== ""
      ? typeof value === "string"
        ? value
        : String(value)
      : typeof fallback === "string"
        ? translate(fallback, { _: fallback })
        : "";

  // Sync external value changes into the (uncontrolled) editor.
  React.useEffect(() => {
    if (!ref.current) return;
    if (ref.current.getMarkdown() !== markdown) {
      ref.current.setMarkdown(markdown);
    }
  }, [markdown]);

  if (!markdown && fallback && React.isValidElement(fallback)) {
    return fallback;
  }

  return (
    <MDXEditor
      ref={ref}
      readOnly
      plugins={plugins}
      markdown={markdown}
      {...rest}
      className={cn(className, isDark && "mdxeditor-dark")}
    />
  );
};

export { type MdxFieldProps, MdxField };
