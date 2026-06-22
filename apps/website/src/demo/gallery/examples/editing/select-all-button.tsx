import {
  List,
  DataTable,
  BulkActionsToolbar,
  SelectAllButton,
} from "shadmin/components/admin";

export default function SelectAllButtonExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable bulkActionButtons={<BulkActionsToolbar />}>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
      <SelectAllButton />
    </List>
  );
}
