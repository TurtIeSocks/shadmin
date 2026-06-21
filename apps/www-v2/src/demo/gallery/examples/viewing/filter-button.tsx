import {
  List,
  DataTable,
  FilterButton,
  TextInput,
} from "shadmin/components/admin";

export default function FilterButtonExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      filters={[<TextInput key="q" label="Search" source="q" alwaysOn />]}
      actions={<FilterButton />}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
