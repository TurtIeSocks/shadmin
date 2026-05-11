import { memo } from "react";
import { FilterLiveForm, useTranslate } from "ra-core";
import { SearchInput, type SearchInputProps } from "@/components/admin/search-input";

/**
 * Form and search input for doing a full-text search filter from a sidebar.
 *
 * Triggers a search on change (with debounce). Designed to be used in the
 * aside of a `<List>` view, alongside `<FilterList>` and `<FilterListItem>`.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/filterlivesearch/ FilterLiveSearch documentation}
 *
 * @example
 * import { Card } from "@/components/ui/card";
 * import { FilterLiveSearch } from "@/components/admin";
 *
 * const FilterSidebar = () => (
 *   <Card className="p-4">
 *     <FilterLiveSearch />
 *   </Card>
 * );
 */
export const FilterLiveSearch = memo((props: FilterLiveSearchProps) => {
  const translate = useTranslate();
  const {
    source = "q",
    placeholder = translate("ra.action.search", { _: "Search" }),
    ...rest
  } = props;

  return (
    <FilterLiveForm>
      <SearchInput source={source} placeholder={placeholder} {...rest} />
    </FilterLiveForm>
  );
});

export interface FilterLiveSearchProps
  extends Omit<SearchInputProps, "source"> {
  source?: string;
}
