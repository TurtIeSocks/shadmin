import { List, BulkActionsToolbar, DataTable } from "shadmin/components/admin";

export default function BulkActionsToolbarExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable bulkActionsToolbar={<BulkActionsToolbar />}>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
