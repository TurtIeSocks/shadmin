import type { HTMLAttributes } from "react";
import { useTimeout } from "ra-core";

import { cn } from "@/lib/utils";

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Delay in milliseconds before showing the progress bar.
   * @default 1000
   */
  timeout?: number;
}

/**
 * Linear progress bar with a delay before it appears, designed to replace
 * an input or a field in a form layout while data is loading. Avoids
 * visual jumps when finally replaced by the resolved value.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/linearprogress/ LinearProgress documentation}
 *
 * @example
 * import { LinearProgress } from "@/components/admin/linear-progress";
 *
 * const ReferenceFieldFallback = () => <LinearProgress />;
 */
export const LinearProgress = (props: LinearProgressProps) => {
  const { className, timeout = 1000, ...rest } = props;
  const oneSecondHasPassed = useTimeout(timeout);

  if (!oneSecondHasPassed) {
    return <span className="block my-1 h-1" />;
  }

  return (
    <div
      className={cn(
        "my-2 w-40 h-1 overflow-hidden rounded bg-muted",
        className,
      )}
      {...rest}
    >
      <div className="h-full w-1/2 bg-primary animate-pulse" />
    </div>
  );
};
