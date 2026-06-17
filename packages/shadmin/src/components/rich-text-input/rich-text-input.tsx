import type { InputProps } from "shadmin-core";
import {
  FieldTitle,
  useInput,
  useResourceContext,
  ValidationError,
} from "shadmin-core";
import type { UseEditorOptions } from "@tiptap/react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputHelperText } from "@/components/admin/common/input-helper-text";
import {
  MinimalTiptapEditor,
  type MinimalTiptapToolbar,
} from "@/components/rich-text-input/minimal-tiptap";
import { RichTextInputToolbar } from "@/components/rich-text-input/rich-text-input-toolbar";
import { DefaultEditorOptions } from "./default-editor-options";

type RichTextInputProps = InputProps & {
  className?: string;
  toolbar?: MinimalTiptapToolbar;
  editorOptions?: Partial<UseEditorOptions>;
};

/**
 * Rich text editor input powered by TipTap.
 *
 * Stores HTML by default and supports the usual input props used by the kit.
 * Pass additional TipTap options via `editorOptions`.
 */
function RichTextInput(props: RichTextInputProps) {
  const {
    className,
    defaultValue = "",
    disabled,
    editorOptions = DefaultEditorOptions,
    helperText,
    label,
    readOnly,
    source,
    toolbar,
    validate: _validateProp,
    format: _formatProp,
  } = props;
  const resource = useResourceContext(props);
  const { id, field, fieldState, isRequired } = useInput({
    ...props,
    source,
    defaultValue,
  });

  const invalid = fieldState.invalid;
  const errorMessage =
    fieldState.error?.root?.message ?? fieldState.error?.message;

  const resolvedToolbar = toolbar ?? <RichTextInputToolbar />;

  return (
    <Field className={className} data-invalid={invalid || undefined}>
      {label !== false && (
        <FieldLabel htmlFor={id}>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FieldLabel>
      )}
      {/* TipTap has no plain focusable control taking id/aria-invalid; id lands on the wrapper for the label's htmlFor */}
      <div id={id}>
        <MinimalTiptapEditor
          {...editorOptions}
          value={field.value ?? ""}
          onChange={(value) => {
            field.onChange(value);
          }}
          onBlur={() => {
            field.onBlur?.();
          }}
          output="html"
          editable={!disabled && !readOnly}
          toolbar={resolvedToolbar}
        />
      </div>
      <InputHelperText helperText={helperText} />
      <FieldError>
        {invalid && errorMessage ? (
          <ValidationError error={errorMessage} />
        ) : null}
      </FieldError>
    </Field>
  );
}

export { RichTextInput, type RichTextInputProps };
