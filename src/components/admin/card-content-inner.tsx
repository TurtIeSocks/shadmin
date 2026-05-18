import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface CardContentInnerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Card content variant with reduced padding for stacked use inside a
 * single Card.
 *
 * When several blocks of card content sit next to one another, the
 * default vertical padding of `<CardContent>` doubles between blocks
 * and wastes space. `CardContentInner` zeroes out vertical padding for
 * inner items and keeps it for the first and last children.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/cardcontentinner/ CardContentInner documentation}
 *
 * @example
 * import { Card } from "@/components/ui/card";
 * import { CardContentInner } from "@/components/admin/card-content-inner";
 *
 * const Stack = () => (
 *   <Card>
 *     <CardContentInner>First section</CardContentInner>
 *     <CardContentInner>Second section</CardContentInner>
 *     <CardContentInner>Third section</CardContentInner>
 *   </Card>
 * );
 */
export const CardContentInner = ({
  className,
  children,
}: CardContentInnerProps) => (
  <div
    className={cn(
      "px-6 py-0 first:pt-4 last:pb-[70px] sm:last:pb-4",
      className,
    )}
  >
    {children}
  </div>
);
