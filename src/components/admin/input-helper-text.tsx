import { useTranslate } from "ra-core";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import { FormDescription } from "@/components/admin/form";

/**
 * Renders helper text below form inputs with automatic translation support.
 *
 * @internal
 */
interface InputHelperTextProps {
  helperText?: ReactNode | false;
}

function InputHelperText({
  helperText,
}: InputHelperTextProps) {
  const translate = useTranslate();

  if (helperText === false) {
    return null;
  }

  if (helperText == null) {
    return null;
  }

  if (isValidElement(helperText)) {
    return helperText;
  }

  return (
    <FormDescription>
      {typeof helperText === "string"
        ? translate(helperText, { _: helperText })
        : helperText}
    </FormDescription>
  );
}

export { InputHelperText, type InputHelperTextProps };
