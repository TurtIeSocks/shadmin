import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PlaceholderProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Tiny placeholder block used while data is loading.
 *
 * Renders an inline-flex span filled with the muted background colour so
 * a row of fields keeps its height during a fetch.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/placeholder/ Placeholder documentation}
 *
 * @example
 * import { Placeholder } from "@/components/admin/placeholder";
 *
 * const LoadingField = () => <Placeholder className="w-24" />;
 */
export const Placeholder = ({ className, children }: PlaceholderProps) => (
  <span className={cn("inline-flex bg-muted", className)}>
    {children ?? " "}
  </span>
);
