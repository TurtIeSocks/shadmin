import { List, DataTable, BulkDeleteButton } from "shadmin/components/admin";

export default function BulkDeleteButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable bulkActionButtons={<BulkDeleteButton />}>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
