/**
 * Re-export `FilterLiveForm` from `ra-core` so it is available alongside the
 * other admin components.
 *
 * `<FilterLiveForm>` wraps form inputs and automatically pushes their values to
 * the surrounding `<ListContext>` filter state on each change.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/filter-live-form FilterLiveForm documentation}
 *
 * @example
 * import { Card } from "@/components/ui/card";
 * import { FilterLiveForm, TextInput } from "@/components/admin";
 *
 * const FilterSidebar = () => (
 *   <Card className="p-4">
 *     <FilterLiveForm>
 *       <TextInput source="title" resettable helperText={false} />
 *     </FilterLiveForm>
 *   </Card>
 * );
 */
export { FilterLiveForm } from "ra-core";
export type { FilterLiveFormProps } from "ra-core";
