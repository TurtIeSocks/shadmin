import {
  List,
  DataTable,
  FilterLiveForm,
  TextInput,
} from "shadmin/components/admin";

export default function FilterLiveFormExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <FilterLiveForm>
        <TextInput source="q" label="Search" />
      </FilterLiveForm>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
