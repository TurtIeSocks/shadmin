import {
  List,
  FilterList,
  FilterListItem,
  FilterListSection,
  DataTable,
} from "shadmin/components/admin";

export default function FilterListSectionExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <div className="flex gap-4">
        <aside className="w-44 shrink-0">
          <FilterListSection label="Order Filters">
            <FilterList label="Status">
              <FilterListItem label="Ordered" value={{ status: "ordered" }} />
              <FilterListItem
                label="Delivered"
                value={{ status: "delivered" }}
              />
            </FilterList>
          </FilterListSection>
        </aside>
        <DataTable>
          <DataTable.Col source="id" />
          <DataTable.Col source="reference" />
          <DataTable.Col source="status" />
        </DataTable>
      </div>
    </List>
  );
}
