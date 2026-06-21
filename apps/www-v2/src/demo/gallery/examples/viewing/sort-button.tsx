import { List, DataTable, SortButton } from "shadmin/components/admin";

export default function SortButtonExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      actions={<SortButton fields={["id", "reference", "status"]} />}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
