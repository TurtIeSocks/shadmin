import { List, DataTable, BulkUpdateButton } from "shadmin/components/admin";

export default function BulkUpdateButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable
        bulkActionButtons={
          <BulkUpdateButton label="Mark Active" data={{ status: "active" }} />
        }
      >
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
