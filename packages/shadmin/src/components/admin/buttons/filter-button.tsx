import * as React from "react";
import type { HtmlHTMLAttributes, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  isValidElement,
} from "react";
import isEqual from "lodash/isEqual";
import queryString from "query-string";
import {
  extractValidSavedQueries,
  type SavedQuery,
  useFilterContext,
  useListContext,
  useResourceContext,
  useSavedQueries,
  useTranslate,
} from "shadmin-core";
import { useNavigate } from "react-router";
import {
  Bookmark,
  BookmarkMinus,
  BookmarkPlus,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldLabelText } from "@/components/admin/common/field-label-text";
import {
  AddSavedQueryDialog,
  RemoveSavedQueryDialog,
} from "@/components/admin/layout/saved-queries";
import type { UnknownValue } from "@/lib/unknown-types";

interface FilterElementProps {
  source: string;
  alwaysOn?: boolean;
  defaultValue?: UnknownValue;
  label?: React.ReactNode;
  disabled?: boolean;
}

/**
 * A button that opens a dropdown to add, remove, and manage filters.
 *
 * Displays available filters, saved queries, and options to save or clear current filters.
 * Works with the FilterForm to provide a complete filtering UI.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/filter-button FilterButton documentation}
 */
interface FilterButtonProps extends HtmlHTMLAttributes<HTMLDivElement> {
  className?: string;
  disableSaveQuery?: boolean;
  filters?: ReactNode[];
  resource?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

interface FilterButtonMenuItemProps {
  filter: React.ReactElement<FilterElementProps>;
  displayed: boolean;

  onShow: (params: { source: string; defaultValue: UnknownValue }) => void;
  onHide: (params: { source: string }) => void;
  resource?: string;
  autoFocus?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

function FilterButton(props: FilterButtonProps) {
  const {
    filters: filtersProp,
    className,
    disableSaveQuery,
    size,
    variant = "outline",
    ...rest
  } = props;
  const filters = useFilterContext() || filtersProp;
  const resource = useResourceContext(props);
  const translate = useTranslate();
  if (!resource && !disableSaveQuery) {
    throw new Error(
      "<FilterButton> must be called inside a ResourceContextProvider, or must provide a resource prop",
    );
  }
  const [savedQueries] = useSavedQueries(resource || "");
  const navigate = useNavigate();
  const {
    displayedFilters = {},
    filterValues,
    perPage,
    setFilters,
    showFilter,
    hideFilter,
    sort,
  } = useListContext();
  const hasFilterValues = !isEqual(filterValues, {});
  const validSavedQueries = extractValidSavedQueries(savedQueries);
  const hasSavedCurrentQuery = validSavedQueries.some((savedQuery) =>
    isEqual(savedQuery.value, {
      filter: filterValues,
      sort,
      perPage,
      displayedFilters,
    }),
  );
  const [open, setOpen] = useState(false);

  if (filters === undefined) {
    throw new Error(
      "The <FilterButton> component requires the <List filters> prop to be set",
    );
  }

  const allTogglableFilters = filters.filter(
    (filterElement) =>
      isValidElement(filterElement) &&
      !(filterElement.props as FilterElementProps).alwaysOn,
  );

  const handleShow = useCallback(
    ({
      source,
      defaultValue,
    }: {
      source: string;
      defaultValue: UnknownValue;
    }) => {
      showFilter(source, defaultValue === "" ? undefined : defaultValue);
      // We have to fallback to imperative code because the new FilterFormInput
      // has no way of knowing it has just been displayed (and thus that it should focus its input)
      setTimeout(() => {
        const inputElement = document.querySelector(
          `input[name='${source}']`,
        ) as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 50);
      setOpen(false);
    },
    [showFilter],
  );

  const handleRemove = useCallback(
    ({ source }: { source: string }) => {
      hideFilter(source);
      setOpen(false);
    },
    [hideFilter],
  );

  // add query dialog state
  const [addSavedQueryDialogOpen, setAddSavedQueryDialogOpen] = useState(false);
  const hideAddSavedQueryDialog = (): void => {
    setAddSavedQueryDialogOpen(false);
  };
  const showAddSavedQueryDialog = (): void => {
    setOpen(false);
    setAddSavedQueryDialogOpen(true);
  };

  // remove query dialog state
  const [removeSavedQueryDialogOpen, setRemoveSavedQueryDialogOpen] =
    useState(false);
  const hideRemoveSavedQueryDialog = (): void => {
    setRemoveSavedQueryDialogOpen(false);
  };
  const showRemoveSavedQueryDialog = (): void => {
    setOpen(false);
    setRemoveSavedQueryDialogOpen(true);
  };

  if (
    allTogglableFilters.length === 0 &&
    validSavedQueries.length === 0 &&
    !hasFilterValues
  ) {
    return null;
  }
  return (
    <div className={cn("inline-block", className)} {...rest}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            className="add-filter"
            variant={variant}
            size={size}
            aria-haspopup="true"
          >
            <Filter />
            {translate("ra.action.add_filter")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {allTogglableFilters
            .filter(
              (
                filterElement,
              ): filterElement is React.ReactElement<FilterElementProps> =>
                isValidElement(filterElement),
            )
            .map((filterElement, index: number) => (
              <FilterButtonMenuItem
                key={filterElement.props.source}
                filter={filterElement}
                displayed={!!displayedFilters[filterElement.props.source]}
                resource={resource}
                onShow={handleShow}
                onHide={handleRemove}
                autoFocus={index === 0}
              />
            ))}
          {(hasFilterValues || validSavedQueries.length > 0) && (
            <DropdownMenuSeparator />
          )}
          {validSavedQueries.map((savedQuery: SavedQuery) =>
            isEqual(savedQuery.value, {
              filter: filterValues,
              sort,
              perPage,
              displayedFilters,
            }) ? (
              <DropdownMenuItem
                onClick={showRemoveSavedQueryDialog}
                key={savedQuery.label}
              >
                <BookmarkMinus className="size-4 mr-2" />
                {translate("ra.saved_queries.remove_label_with_name", {
                  _: 'Remove query "%{name}"',
                  name: savedQuery.label,
                })}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(): void => {
                  navigate({
                    search: queryString.stringify({
                      filter: JSON.stringify(savedQuery.value.filter),
                      sort: savedQuery.value.sort?.field,
                      order: savedQuery.value.sort?.order,
                      page: 1,
                      perPage: savedQuery.value.perPage,
                      displayedFilters: JSON.stringify(
                        savedQuery.value.displayedFilters,
                      ),
                    }),
                  });
                  setOpen(false);
                }}
                key={savedQuery.label}
              >
                <Bookmark className="size-4 mr-2" />
                {savedQuery.label}
              </DropdownMenuItem>
            ),
          )}
          {hasFilterValues && !hasSavedCurrentQuery && !disableSaveQuery && (
            <DropdownMenuItem onClick={showAddSavedQueryDialog}>
              <BookmarkPlus className="size-4 mr-2" />
              {translate("ra.saved_queries.new_label", {
                _: "Save current query...",
              })}
            </DropdownMenuItem>
          )}
          {hasFilterValues && (
            <DropdownMenuItem
              onClick={() => {
                setFilters({}, {});
                setOpen(false);
              }}
            >
              <X className="size-4 mr-2" />
              {translate("ra.action.remove_all_filters", {
                _: "Remove all filters",
              })}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {!disableSaveQuery && (
        <>
          <AddSavedQueryDialog
            open={addSavedQueryDialogOpen}
            onClose={hideAddSavedQueryDialog}
          />
          <RemoveSavedQueryDialog
            open={removeSavedQueryDialogOpen}
            onClose={hideRemoveSavedQueryDialog}
          />
        </>
      )}
    </div>
  );
}

/**
 * A menu item rendered inside the `<FilterButton>` dropdown for toggling an
 * optional filter's visibility in the `<FilterForm>`.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/filter-button FilterButton documentation}
 */
function FilterButtonMenuItem(props: FilterButtonMenuItemProps) {
  const { filter, onShow, onHide, displayed, autoFocus, ref } = props;
  const resource = useResourceContext(props);
  const localRef = useRef<HTMLDivElement | null>(null);
  const handleShow = useCallback(() => {
    onShow({
      source: filter.props.source,
      defaultValue: filter.props.defaultValue,
    });
  }, [filter.props.defaultValue, filter.props.source, onShow]);
  const handleHide = useCallback(() => {
    onHide({
      source: filter.props.source,
    });
  }, [filter.props.source, onHide]);
  useEffect(() => {
    if (autoFocus) {
      localRef.current?.focus();
    }
  }, [autoFocus]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  return (
    <DropdownMenuCheckboxItem
      className="new-filter-item"
      checked={displayed}
      onCheckedChange={(next) => (next ? handleShow() : handleHide())}
      onSelect={(e) => e.preventDefault()}
      disabled={filter.props.disabled}
      data-key={filter.props.source}
      data-default-value={filter.props.defaultValue}
      ref={setRefs}
    >
      <FieldLabelText
        label={filter.props.label}
        source={filter.props.source}
        resource={resource}
      />
    </DropdownMenuCheckboxItem>
  );
}

export {
  FilterButton,
  type FilterButtonProps,
  FilterButtonMenuItem,
  type FilterButtonMenuItemProps,
};
