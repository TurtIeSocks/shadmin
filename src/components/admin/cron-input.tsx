import type * as React from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
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
export const CronInput = (props: CronInputProps) => {
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

  const {
    onChange: _stripChange,
    onBlur: _stripBlur,
    ...sansHandlers
  } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const exprRaw = (field.value as string | null | undefined) ?? "";
  const preview = exprRaw ? describeCron(exprRaw) : null;

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
        <div className={cn("flex flex-col gap-1", className)} {...rest}>
          <Input
            type="text"
            value={exprRaw}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder="* * * * *"
            className="font-mono"
          />
          <span
            data-cron-preview
            className="text-xs text-muted-foreground"
          >
            {preview ?? (exprRaw && !preview ? "Invalid cron" : "")}
          </span>
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface CronInputProps
  extends InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  disabled?: boolean;
}
