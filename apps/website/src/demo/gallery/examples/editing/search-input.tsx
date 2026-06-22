import { List, DataTable, SearchInput } from "shadmin/components/admin";

export default function SearchInputExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      filters={[<SearchInput key="q" source="q" alwaysOn />]}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
