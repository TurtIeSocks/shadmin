import type * as React from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { ColorPicker } from "@/components/ui/color-picker";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Color picker input. Stores a CSS color string (hex by default).
 *
 * Wraps the `<ColorPicker>` UI primitive — opens a popover with an
 * oklch L×C pad, hue / alpha strips, and a mode switcher (oklch / oklab /
 * hex / rgb / hsl / hwb). Pass `swatches` to render a row of quick-set
 * preset buttons next to the trigger.
 *
 * @example
 * import { Edit, SimpleForm, ColorInput } from '@/components/admin';
 *
 * const BrandEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <ColorInput source="color" swatches={["#3b82f6", "#22c55e"]} />
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
    mode,
    native,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  // Strip `onChange` / `onBlur` from the props passed to `useInput` so the
  // user's handlers aren't invoked twice (once by ra-core's `useInput`
  // wiring and once by our handlers below).
  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const value = (field.value as string | undefined) ?? "#000000";

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
        <fieldset
          disabled={disabled}
          // `fieldset[disabled]` blocks all inner form controls (incl. the
          // picker trigger button + swatch buttons). The classes below add the
          // visual cue and prevent stray hover states.
          className={cn(
            "flex items-center gap-2 border-0 p-0",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <ColorPicker
            value={value}
            onChange={(next) => field.onChange(next)}
            mode={mode}
            native={native}
            aria-label="Pick a color"
          />
          {swatches?.map((s) => (
            <button
              key={s}
              type="button"
              data-color-swatch
              aria-label={`Select color ${s}`}
              onClick={() => field.onChange(s)}
              className={cn(
                "h-6 w-6 rounded border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "cursor-not-allowed",
              )}
              style={{ backgroundColor: s }}
            />
          ))}
        </fieldset>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface ColorInputProps
  extends
    InputProps,
    Omit<
      React.ComponentProps<"input">,
      "defaultValue" | "onBlur" | "onChange" | "type"
    > {
  /** Quick-set color buttons rendered next to the picker trigger. */
  swatches?: readonly string[];
  /**
   * Force the picker to output values in a specific mode.
   *
   * @see ColorPicker
   */
  mode?: React.ComponentProps<typeof ColorPicker>["mode"];
  /**
   * Replace the popover picker with the browser's native `<input type="color">`.
   *
   * @see ColorPicker
   */
  native?: boolean;
}
