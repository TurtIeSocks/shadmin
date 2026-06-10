import type * as React from "react";
import type { InputProps } from "ra-core";
import {
  FieldTitle,
  useInput,
  useResourceContext,
  ValidationError,
} from "ra-core";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { describeCron } from "./cron-utils";
import { cn } from "@/lib/utils";

/**
 * Edits a 5-field cron expression and previews its human meaning live.
 *
 * @example
 * <CronInput source="schedule" />
 */
function CronInput(props: CronInputProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, fieldState, isRequired } = useInput(sansHandlers);

  const invalid = fieldState.invalid;
  const errorMessage =
    fieldState.error?.root?.message ?? fieldState.error?.message;

  const exprRaw = (field.value as string | null | undefined) ?? "";
  const preview = exprRaw ? describeCron(exprRaw) : null;

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
      <div className={cn("flex flex-col gap-1", className)} {...rest}>
        <Input
          type="text"
          value={exprRaw}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          disabled={disabled}
          placeholder="* * * * *"
          className="font-mono"
          id={id}
          aria-invalid={invalid || undefined}
        />
        <span data-cron-preview className="text-xs text-muted-foreground">
          {preview ?? (exprRaw && !preview ? "Invalid cron" : "")}
        </span>
      </div>
      <InputHelperText helperText={helperText} />
      <FieldError>
        {invalid && errorMessage ? (
          <ValidationError error={errorMessage} />
        ) : null}
      </FieldError>
    </Field>
  );
};

interface CronInputProps
  extends
    InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  disabled?: boolean;
}

export { CronInput, type CronInputProps };
