import { List, DataTable, BulkExportButton } from "shadmin/components/admin";

export default function BulkExportButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable bulkActionButtons={<BulkExportButton />}>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
