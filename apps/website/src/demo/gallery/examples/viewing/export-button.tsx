import { List, DataTable, ExportButton } from "shadmin/components/admin";

export default function ExportButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation actions={<ExportButton />}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
