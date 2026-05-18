import { Loader2 } from "lucide-react";
import { useLoading, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import { RefreshIconButton } from "@/components/admin/refresh-icon-button";

export interface LoadingIndicatorProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Small inline spinner that appears whenever the data provider has a
 * query or a mutation in flight.
 *
 * Backed by ra-core's `useLoading` hook. When idle, renders a
 * `<RefreshIconButton>` so the user can manually trigger a refresh.
 * When loading, shows a spinner with the refresh button overlaid at
 * opacity-0 so the layout does not shift.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loadingindicator/ LoadingIndicator documentation}
 */
export const LoadingIndicator = (props: LoadingIndicatorProps) => {
  const { className, onClick } = props;
  const loading = useLoading();
  const translate = useTranslate();

  return (
    <div className={cn("relative size-4", className)}>
      <RefreshIconButton
        onClick={onClick}
        className={cn(
          "size-4 p-0 transition-opacity",
          loading ? "opacity-0" : "opacity-100",
        )}
      />
      {loading && (
        <Loader2
          role="status"
          aria-label={translate("ra.page.loading", { _: "Loading" })}
          className="absolute inset-0 size-4 animate-spin text-muted-foreground"
        />
      )}
    </div>
  );
};
