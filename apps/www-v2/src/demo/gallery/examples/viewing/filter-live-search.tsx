import { List, DataTable, FilterLiveSearch } from "shadmin/components/admin";

export default function FilterLiveSearchExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <FilterLiveSearch />
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
