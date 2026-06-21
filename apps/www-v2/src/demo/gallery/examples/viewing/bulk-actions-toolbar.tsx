import { List } from "shadmin/components/admin";
import { BulkActionsToolbar } from "shadmin/components/admin";
import { DataTable } from "shadmin/components/admin";

export default function BulkActionsToolbarExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable bulkActionButtons={<BulkActionsToolbar />}>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
