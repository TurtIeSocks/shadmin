import {
  CreateButton,
  DataTable,
  ExportButton,
  List,
  ReferenceField,
  TextInput,
} from "shadmin/components/admin";

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
];

export default function Example() {
  return (
    <List
      resource="orders"
      sort={{ field: "date", order: "DESC" }}
      perPage={25}
      filters={filters}
      disableSyncWithLocation
      actions={
        <div className="flex items-center gap-2">
          <CreateButton />
          <ExportButton />
        </div>
      }
    >
      <DataTable>
        <DataTable.Col source="reference" />
        <DataTable.Col source="customer_id" label="Customer">
          <ReferenceField source="customer_id" reference="customers" />
        </DataTable.Col>
        <DataTable.Col source="status" />
        <DataTable.NumberCol
          source="total"
          options={{ style: "currency", currency: "USD" }}
          className="text-right"
        />
      </DataTable>
    </List>
  );
}
