import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ReferenceErrorProps {
  label?: ReactNode;
  error: Error;
}

/**
 * Disabled input used to surface an error from a reference lookup.
 *
 * Shows the label, a disabled input, and the error message below it in
 * the destructive colour. New code should use the regular
 * `<ReferenceInput>` error handling instead.
 *
 * @deprecated Use `<ReferenceInput>` error handling instead.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/referenceerror/ ReferenceError documentation}
 */
export const ReferenceError = ({ label, error }: ReferenceErrorProps) => (
  <div className="my-2 flex flex-col gap-1.5">
    {label != null ? <Label>{label}</Label> : null}
    <Input disabled aria-invalid="true" />
    <span className="text-destructive text-xs">{error?.message}</span>
  </div>
);
