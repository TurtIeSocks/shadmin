import { Loader2 } from "lucide-react";
import { useLoading, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

export interface LoadingIndicatorProps {
  className?: string;
}

/**
 * Small inline spinner that appears whenever the data provider has a
 * query or a mutation in flight.
 *
 * Backed by ra-core's `useLoading` hook: renders `null` while idle so it can
 * be safely dropped into headers, toolbars or app bars. The icon size and
 * colours follow Tailwind utilities and can be overridden via `className`.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loadingindicator/ LoadingIndicator documentation}
 */
export const LoadingIndicator = (props: LoadingIndicatorProps) => {
  const { className } = props;
  const loading = useLoading();
  const translate = useTranslate();
  if (!loading) return null;
  return (
    <Loader2
      role="status"
      aria-label={translate("ra.page.loading", { _: "Loading" })}
      className={cn("size-4 animate-spin text-muted-foreground", className)}
    />
  );
};
