import * as React from "react";
import { useMemo } from "react";
import { ValidationError } from "ra-core";
import { FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label, LabelPrimitive } from "@/components/ui/label";
import { SlotPrimitive } from "@/components/ui/slot";
import { FormItemContext, FormItemContextValue, useFormField } from "../../hooks/use-form-field";

const Form = FormProvider;

function FormField({ className, id, name, ...props }: FormItemProps) {
  const contextValue: FormItemContextValue = useMemo(
    () => ({
      id,
      name,
    }),
    [id, name],
  );

  return (
    <FormItemContext.Provider value={contextValue}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        role="group"
        {...props}
      />
    </FormItemContext.Provider>
  );
}

interface FormItemProps extends Omit<React.ComponentProps<"div">, "id"> {
  id: string;
  name: string;
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({
  ...props
}: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <SlotPrimitive.Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <div
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormError({ className, ...props }: React.ComponentProps<"p">) {
  const { invalid, error, formMessageId } = useFormField();

  const err = error?.root?.message ?? error?.message;
  if (!invalid || !err) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      <ValidationError error={err} />
    </p>
  );
}

export { Form, FormField, FormLabel, FormControl, FormDescription, FormError };
