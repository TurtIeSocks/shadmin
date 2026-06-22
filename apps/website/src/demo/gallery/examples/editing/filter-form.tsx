import {
  List,
  DataTable,
  FilterForm,
  TextInput,
} from "shadmin/components/admin";

const filters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <TextInput key="reference" source="reference" label="Reference" />,
];

export default function FilterFormExample() {
  return (
    <List resource="orders" disableSyncWithLocation filters={filters}>
      <FilterForm />
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}
