import type * as React from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import { FormControl, FormField, FormLabel } from "@/components/admin/form";
import { FormError } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
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
export const RatingInput = (props: RatingInputProps) => {
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
  const { id, field, isRequired } = useInput(props);

  const steps = allowHalf ? max * 2 : max;
  const stepValue = allowHalf ? 0.5 : 1;
  const currentValue = (field.value as number | null | undefined) ?? 0;

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
        <div
          role="radiogroup"
          aria-disabled={disabled}
          className={cn("flex items-center gap-1", className)}
          {...rest}
        >
          {Array.from({ length: steps }).map((_, i) => {
            const v = (i + 1) * stepValue;
            const selected = currentValue >= v;
            return (
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
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

const Star = ({ filled, half }: { filled: boolean; half: boolean }) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    fill={filled ? "currentColor" : "none"}
    className="text-yellow-500"
    aria-hidden
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

export interface RatingInputProps
  extends
    InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  max?: number;
  allowHalf?: boolean;
  disabled?: boolean;
}
