import { List, DataTable, ColumnsButton } from "shadmin/components/admin";

export default function ColumnsButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation actions={<ColumnsButton />}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
        <DataTable.Col source="total_ex_taxes" label="Total" />
      </DataTable>
    </List>
  );
}
