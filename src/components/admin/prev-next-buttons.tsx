/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import {
  type RaRecord,
  type UsePrevNextControllerProps,
  usePrevNextController,
  useTranslate,
} from "ra-core";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrevNextButtonsProps<RecordType extends RaRecord = any>
  extends UsePrevNextControllerProps<RecordType> {
  className?: string;
}

/**
 * Renders previous/next record navigation buttons for a Show or Edit view.
 *
 * Uses `usePrevNextController` to fetch the surrounding records and displays
 * the current index out of the total. Must be used within a `RecordContext`,
 * typically inside a `<Show>` or `<Edit>` view.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/prevnextbuttons/ PrevNextButtons documentation}
 *
 * @example
 * import { Edit, PrevNextButtons } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit actions={<PrevNextButtons />}>
 *     ...
 *   </Edit>
 * );
 */
export const PrevNextButtons = <RecordType extends RaRecord = any>(
  props: PrevNextButtonsProps<RecordType>,
) => {
  const { className } = props;
  const {
    hasPrev,
    hasNext,
    prevPath,
    nextPath,
    index,
    total,
    error,
    isPending,
  } = usePrevNextController<RecordType>(props);
  const translate = useTranslate();

  if (isPending) {
    return (
      <div
        role="navigation"
        className={cn(
          "inline-flex items-center gap-2 min-h-[34px]",
          className,
        )}
      >
        <div className="h-1 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  if (error) {
    return (
      <AlertCircle
        className="h-4 w-4 text-destructive"
        aria-label={translate("ra.notification.http_error", { _: "Error" })}
      />
    );
  }
  if (!hasPrev && !hasNext) {
    return <div className="min-h-[34px]" />;
  }

  return (
    <nav
      role="navigation"
      className={cn("inline-flex items-center gap-2", className)}
    >
      {hasPrev && prevPath ? (
        <Link
          to={prevPath}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label={translate("ra.navigation.previous")}
        >
          <ChevronLeft />
        </Link>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={translate("ra.navigation.previous")}
        >
          <ChevronLeft />
        </Button>
      )}

      {typeof index === "number" && (
        <span className="text-sm tabular-nums">
          {index + 1} / {total}
        </span>
      )}

      {hasNext && nextPath ? (
        <Link
          to={nextPath}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label={translate("ra.navigation.next")}
        >
          <ChevronRight />
        </Link>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={translate("ra.navigation.next")}
        >
          <ChevronRight />
        </Button>
      )}
    </nav>
  );
};
