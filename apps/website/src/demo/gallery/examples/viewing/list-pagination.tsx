import { List, DataTable, ListPagination } from "shadmin/components/admin";

export default function ListPaginationExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      pagination={<ListPagination />}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
