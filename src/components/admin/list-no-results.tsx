import {
  useGetResourceLabel,
  useListContextWithProps,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UnknownRecord } from "@/lib/unknown-types";

export interface ListNoResultsProps {
  resource?: string;
  filterValues?: UnknownRecord;
  setFilters?: (
    filters: UnknownRecord,
    displayedFilters?: UnknownRecord,
  ) => void;
  className?: string;
}

/**
 * Shown by `<List>` when filters yield zero results.
 *
 * Mirrors the upstream ra-ui-materialui ListNoResults component:
 * displays a translated message and, when filters are active, a button
 * to clear them.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/listnoresults/ ListNoResults documentation}
 */
export const ListNoResults = (props: ListNoResultsProps) => {
  const { className } = props;
  const translate = useTranslate();
  const resource = useResourceContext(props);
  const { filterValues, setFilters } = useListContextWithProps(props);
  const getResourceLabel = useGetResourceLabel();
  if (!resource) {
    throw new Error(
      "<ListNoResults> must be used inside a <List> component (or a ResourceContextProvider)",
    );
  }
  const hasActiveFilters =
    !!filterValues && !!setFilters && Object.keys(filterValues).length > 0;
  return (
    <div className={cn("py-6 px-4 text-sm text-muted-foreground", className)}>
      {hasActiveFilters ? (
        <>
          <span>
            {translate("ra.navigation.no_filtered_results", {
              resource,
              name: getResourceLabel(resource, 0),
              _: "No results found with the current filters.",
            })}
          </span>{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto align-baseline"
            onClick={() => setFilters({}, {})}
          >
            {translate("ra.navigation.clear_filters", { _: "Clear filters" })}
          </Button>
        </>
      ) : (
        <span>
          {translate("ra.navigation.no_results", {
            resource,
            name: getResourceLabel(resource, 0),
            _: "No results found.",
          })}
        </span>
      )}
    </div>
  );
};
