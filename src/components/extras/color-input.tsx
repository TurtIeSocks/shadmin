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
import { cn } from "@/lib/utils";

/**
 * Color picker input. Stores a CSS color string (hex by default).
 *
 * Backed by the native `<input type="color">` element. Optionally renders
 * a row of preset swatch buttons that set the value on click.
 *
 * @example
 * import { Edit, SimpleForm, ColorInput } from '@/components/admin';
 *
 * const BrandEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <ColorInput source="color" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const ColorInput = (props: ColorInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    swatches,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  // Strip `onChange` / `onBlur` from the props passed to `useInput` so the
  // user's handlers aren't invoked twice (once by ra-core's `useInput`
  // wiring and once by our handlers below).
  const {
    onChange: _stripChange,
    onBlur: _stripBlur,
    ...sansHandlers
  } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

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
        <div className="flex items-center gap-2">
          <Input
            {...rest}
            type="color"
            value={(field.value as string | undefined) ?? "#000000"}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            disabled={disabled}
            className="h-9 w-12 cursor-pointer p-1"
          />
          {swatches?.map((s) => (
            <button
              key={s}
              type="button"
              data-color-swatch
              aria-label={`Select color ${s}`}
              disabled={disabled}
              onClick={() => !disabled && field.onChange(s)}
              className={cn(
                "h-6 w-6 rounded border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "cursor-not-allowed opacity-50",
              )}
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface ColorInputProps
  extends InputProps,
    Omit<
      React.ComponentProps<"input">,
      "defaultValue" | "onBlur" | "onChange" | "type"
    > {
  swatches?: readonly string[];
}
