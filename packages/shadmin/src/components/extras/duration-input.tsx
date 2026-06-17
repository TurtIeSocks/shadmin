import type * as React from "react";
import { useEffect, useState } from "react";
import type { InputProps } from "shadmin-core";
import {
  FieldTitle,
  useInput,
  useResourceContext,
  ValidationError,
} from "shadmin-core";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { parseIsoDuration } from "./duration-utils";
import { cn } from "@/lib/utils";

type Unit = "d" | "h" | "m" | "s";
const UNIT_LABEL: Record<Unit, string> = {
  d: "days",
  h: "hours",
  m: "minutes",
  s: "seconds",
};

/**
 * Edits an ISO-8601 duration string via per-unit numeric inputs.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/duration-input DurationInput documentation}
 *
 * @example
 * import { Edit, SimpleForm, DurationInput } from '@/components/admin';
 *
 * const TaskEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <DurationInput source="duration" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
function DurationInput(props: DurationInputProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    units = ["d", "h", "m", "s"] as Unit[],
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

  const parsed = parseIsoDuration(String(field.value ?? "")) ?? {};
  const [values, setValues] = useState<Record<Unit, string>>({
    d: parsed.days?.toString() ?? "",
    h: parsed.hours?.toString() ?? "",
    m: parsed.minutes?.toString() ?? "",
    s: parsed.seconds?.toString() ?? "",
  });

  useEffect(() => {
    const p = parseIsoDuration(String(field.value ?? "")) ?? {};
    setValues({
      d: p.days?.toString() ?? "",
      h: p.hours?.toString() ?? "",
      m: p.minutes?.toString() ?? "",
      s: p.seconds?.toString() ?? "",
    });
  }, [field.value]);

  const writeBack = (next: Record<Unit, string>) => {
    const dayPart = next.d ? `${+next.d}D` : "";
    const timeParts =
      (next.h ? `${+next.h}H` : "") +
      (next.m ? `${+next.m}M` : "") +
      (next.s ? `${+next.s}S` : "");
    const out =
      dayPart || timeParts
        ? `P${dayPart}${timeParts ? `T${timeParts}` : ""}`
        : "";
    field.onChange(out || null);
  };

  return (
    <Field className={className} data-invalid={invalid || undefined}>
      {label !== false && (
        <FieldLabel htmlFor={units.length > 0 ? `${id}-${units[0]}` : id}>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FieldLabel>
      )}
      <div className={cn("flex items-end gap-2", className)} {...rest}>
        {units.map((u) => (
          <label
            key={u}
            htmlFor={`${id}-${u}`}
            className="flex flex-col items-center text-xs text-muted-foreground"
          >
            <Input
              type="number"
              min={0}
              disabled={disabled}
              value={values[u]}
              onChange={(e) => {
                const next = { ...values, [u]: e.target.value };
                setValues(next);
                writeBack(next);
              }}
              onBlur={field.onBlur}
              className="w-16"
              aria-label={UNIT_LABEL[u]}
              id={`${id}-${u}`}
              aria-invalid={invalid || undefined}
            />
            <span>{UNIT_LABEL[u]}</span>
          </label>
        ))}
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

interface DurationInputProps
  extends InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  /** Which units to expose. Default `["d","h","m","s"]`. */
  units?: readonly Unit[];
  disabled?: boolean;
}

export { DurationInput, type DurationInputProps };
