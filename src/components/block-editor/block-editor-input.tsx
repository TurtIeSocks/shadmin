import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";

import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
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
  const { id, field, isRequired } = useInput({ ...props, source, defaultValue });

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
        {/* Keep ARIA props from FormControl on a native element, not on the TipTap hook options */}
        <div>
          <BlockEditor
            value={field.value ?? EMPTY_DOC}
            blocks={blocks}
            placeholder={placeholder}
            editable={!disabled && !readOnly}
            onChange={field.onChange}
            onBlur={() => field.onBlur?.()}
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
}
