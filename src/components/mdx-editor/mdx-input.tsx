import * as React from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import type { InputProps } from "ra-core";

import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { defaultInputPlugins } from "./default-plugins";

type LimitedMDXEditorProps = Omit<
  MDXEditorProps,
  | "markdown"
  | "readOnly"
  | "spellCheck"
  | "onChange"
  | "onBlur"
  | "onError"
  | "ref"
>;

export type MdxInputProps = InputProps & {
  className?: string;
  mdxProps?: LimitedMDXEditorProps;
};

/**
 * A markdown editor input powered by MDXEditor.
 *
 * Stores the field value as a markdown string and integrates with the kit's
 * form helpers (`FormField`, `FormLabel`, validation messages). Pass additional
 * MDXEditor options via `mdxProps`. The `markdown`, `onChange`, `onBlur`,
 * `onError`, `readOnly`, `spellCheck`, and `ref` props are managed internally.
 *
 * @example
 * import { Edit, SimpleForm } from '@/components/admin';
 * import { MdxInput } from '@/components/mdx-editor';
 * import '@mdxeditor/editor/style.css';
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <MdxInput source="body" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const MdxInput = (props: MdxInputProps) => {
  const {
    className,
    defaultValue = "",
    disabled,
    helperText,
    label,
    mdxProps,
    readOnly,
    source,
    validate: _validateProp,
    format: _formatProp,
  } = props;
  const resource = useResourceContext(props);
  const { id, field, isRequired } = useInput({
    ...props,
    source,
    defaultValue,
  });

  const editorRef = React.useRef<MDXEditorMethods | null>(null);
  // Capture the initial markdown once so the (uncontrolled) editor isn't
  // reset on every parent re-render.
  const initialMarkdownRef = React.useRef<string>(
    typeof field.value === "string" ? field.value : "",
  );

  // Sync external value changes (e.g. resetField, setValue) into the editor.
  React.useEffect(() => {
    if (!editorRef.current) return;
    const next = typeof field.value === "string" ? field.value : "";
    if (editorRef.current.getMarkdown() !== next) {
      editorRef.current.setMarkdown(next);
    }
  }, [field.value]);

  const isReadOnly = !!disabled || !!readOnly;

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
        <div>
          <MemoizedEditor
            editorRef={editorRef}
            initialMarkdown={initialMarkdownRef.current}
            readOnly={isReadOnly}
            mdxProps={mdxProps}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

type EditorProps = {
  editorRef: React.RefObject<MDXEditorMethods | null>;
  initialMarkdown: string;
  readOnly: boolean;
  mdxProps?: LimitedMDXEditorProps;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

const EditorImpl = ({
  editorRef,
  initialMarkdown,
  readOnly,
  mdxProps,
  onChange,
  onBlur,
}: EditorProps) => (
  <MDXEditor
    ref={editorRef}
    plugins={defaultInputPlugins}
    markdown={initialMarkdown}
    readOnly={readOnly}
    onChange={onChange}
    onBlur={onBlur}
    {...mdxProps}
  />
);

const MemoizedEditor = React.memo(EditorImpl, (prev, next) => {
  if (prev.readOnly !== next.readOnly) return false;
  if (prev.onChange !== next.onChange) return false;
  if (prev.onBlur !== next.onBlur) return false;
  if (prev.initialMarkdown !== next.initialMarkdown) return false;
  return shallowEqual(prev.mdxProps, next.mdxProps);
});
MemoizedEditor.displayName = "MdxInputEditor";

function shallowEqual(
  prev: Record<string, unknown> | undefined,
  next: Record<string, unknown> | undefined,
): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return prevKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(next, key) &&
      Object.is(prev[key], next[key]),
  );
}
