import { List, DataTable, FieldsSelector } from "shadmin/components/admin";

export default function FieldsSelectorExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      actions={<FieldsSelector />}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
        <DataTable.Col source="total_ex_taxes" label="Total" />
      </DataTable>
    </List>
  );
}
