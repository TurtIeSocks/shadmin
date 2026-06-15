import type { InputProps } from "ra-core";
import {
  FieldTitle,
  useInput,
  useResourceContext,
  ValidationError,
} from "ra-core";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputHelperText } from "@/components/admin/input-helper-text";

import { BlockEditor } from "./block-editor";
import { defaultBlocks } from "./blocks";
import { EMPTY_DOC } from "./constants";
import type { BlockDefinition } from "./define-block";

export interface BlockEditorInputProps extends InputProps {
  className?: string;
  blocks?: BlockDefinition[];
  placeholder?: string;
}

/**
 * Block editor input for ra-core forms. Stores the document as TipTap JSON.
 *
 * Wires {@link BlockEditor} into a react-hook-form field via `useInput`, so it
 * supports the usual input props (label, helperText, validate, disabled,
 * readOnly). The editor re-syncs when the form value changes externally.
 */
export function BlockEditorInput(props: BlockEditorInputProps) {
  const {
    className,
    blocks = defaultBlocks,
    placeholder,
    defaultValue = EMPTY_DOC,
    disabled,
    helperText,
    label,
    readOnly,
    source,
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
        <BlockEditor
          value={field.value ?? EMPTY_DOC}
          blocks={blocks}
          placeholder={placeholder}
          editable={!disabled && !readOnly}
          onChange={field.onChange}
          onBlur={() => field.onBlur?.()}
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
