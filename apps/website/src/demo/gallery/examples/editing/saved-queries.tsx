import {
  List,
  DataTable,
  SavedQueriesList,
  TextInput,
} from "shadmin/components/admin";

const filters = [<TextInput key="q" source="q" label="Search" alwaysOn />];

export default function SavedQueriesExample() {
  return (
    <List resource="orders" disableSyncWithLocation filters={filters}>
      <SavedQueriesList />
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
