import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { FilterContext } from "ra-core";
import { cn } from "@/lib/utils";
import { FilterForm } from "@/components/admin/filter-form";
import { ListActions } from "@/components/admin/list-actions";

export interface ListToolbarProps {
  filters?: ReactElement | ReactNode[];
  actions?: ReactNode | false;
  className?: string;
}

/**
 * Toolbar rendered on top of `<List>` views.
 *
 * Combines an inline `<FilterForm>` on the left with a `<ListActions>` slot
 * on the right (typically holding `<FilterButton>`, `<CreateButton>` and
 * `<ExportButton>`). Custom filters can be passed as an array of inputs or
 * as a single React element — they are exposed through `<FilterContext>` so
 * the children of `<ListActions>` automatically pick them up.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/listtoolbar/ ListToolbar documentation}
 */
export const ListToolbar = (props: ListToolbarProps) => {
  const { filters, actions, className } = props;
  let filtersArray: ReactNode[] | undefined;
  if (Array.isArray(filters)) {
    filtersArray = filters;
  } else if (isValidElement(filters)) {
    const childProps = filters.props as { children?: ReactNode };
    filtersArray = Children.toArray(childProps.children);
  }
  const content = (
    <div
      className={cn(
        "flex justify-between items-start flex-wrap gap-2 my-2",
        className,
      )}
    >
      <div className="flex-1">
        <FilterForm filters={filtersArray} />
      </div>
      {actions === false ? null : <div>{actions ?? <ListActions />}</div>}
    </div>
  );

  if (filtersArray) {
    return (
      <FilterContext.Provider value={filtersArray}>
        {content}
      </FilterContext.Provider>
    );
  }
  return content;
};
