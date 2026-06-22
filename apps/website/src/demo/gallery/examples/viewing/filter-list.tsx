import {
  List,
  DataTable,
  FilterList,
  FilterListItem,
} from "shadmin/components/admin";

export default function FilterListExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <div className="flex gap-4">
        <aside className="w-40 shrink-0">
          <FilterList label="Status">
            <FilterListItem label="Ordered" value={{ status: "ordered" }} />
            <FilterListItem label="Delivered" value={{ status: "delivered" }} />
            <FilterListItem label="Cancelled" value={{ status: "cancelled" }} />
          </FilterList>
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
