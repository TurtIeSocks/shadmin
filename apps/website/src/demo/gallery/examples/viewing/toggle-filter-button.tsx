import { List, DataTable, ToggleFilterButton } from "shadmin/components/admin";

export default function ToggleFilterButtonExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      actions={
        <ToggleFilterButton
          label="Delivered only"
          value={{ status: "delivered" }}
        />
      }
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
