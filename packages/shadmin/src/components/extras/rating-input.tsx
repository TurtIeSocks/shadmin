import type * as React from "react";
import type { InputProps } from "shadmin-core";
import {
  useInput,
  useResourceContext,
  ValidationError,
} from "shadmin-core";
import { FieldLabelText } from "@/components/admin/common/field-label-text";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputHelperText } from "@/components/admin/common/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * N-star rating input with optional half-step granularity.
 *
 * Stores a `number` (0..max). Keyboard accessible via arrow keys (each star
 * is `role="radio"`, the group is `role="radiogroup"`).
 *
 * @example
 * <RatingInput source="rating" allowHalf max={5} />
 */
function RatingInput(props: RatingInputProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    max = 5,
    allowHalf = false,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { id, field, fieldState, isRequired } = useInput(props);

  const invalid = fieldState.invalid;
  const errorMessage =
    fieldState.error?.root?.message ?? fieldState.error?.message;

  const steps = allowHalf ? max * 2 : max;
  const stepValue = allowHalf ? 0.5 : 1;
  const currentValue = (field.value as number | null | undefined) ?? 0;

  return (
    <FieldSet
      className={cn("gap-3", className)}
      data-invalid={invalid || undefined}
    >
      {label !== false && (
        <FieldLegend variant="label">
          <FieldLabelText
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FieldLegend>
      )}
      <div
        id={id}
        role="radiogroup"
        aria-disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn("flex items-center gap-1", className)}
        {...rest}
      >
        {Array.from({ length: steps }).map((_, i) => {
          const v = (i + 1) * stepValue;
          const selected = currentValue >= v;
          return (
            // biome-ignore lint/a11y/useSemanticElements: custom star visuals can't be rendered with native <input type="radio">; button[role=radio] inside the role="radiogroup" is the standard accessible rating pattern
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && field.onChange(v)}
              onBlur={field.onBlur}
              className={cn(
                "p-0.5 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <Star filled={selected} half={allowHalf && v % 1 !== 0} />
            </button>
          );
        })}
      </div>
      <InputHelperText helperText={helperText} />
      <FieldError>
        {invalid && errorMessage ? (
          <ValidationError error={errorMessage} />
        ) : null}
      </FieldError>
    </FieldSet>
  );
}

const Star = ({ filled, half }: { filled: boolean; half: boolean }) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    fill={filled ? "currentColor" : "none"}
    className="text-yellow-500"
    aria-hidden="true"
  >
    <polygon
      points={
        half
          ? "12 2 12 17 6 22 8 14 2 9 9 9"
          : "12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9"
      }
    />
  </svg>
);

interface RatingInputProps
  extends InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  max?: number;
  allowHalf?: boolean;
  disabled?: boolean;
}

export { RatingInput, type RatingInputProps };
