import {
  AutocompleteInput,
  DataTable,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextInput,
} from "shadmin/components/admin";

const STATUS_CHOICES = [
  { id: "ordered", name: "Ordered" },
  { id: "delivered", name: "Delivered" },
  { id: "cancelled", name: "Cancelled" },
];

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
  <ReferenceInput
    key="customer_id"
    source="customer_id"
    reference="customers"
    sort={{ field: "last_name", order: "ASC" }}
  >
    <AutocompleteInput placeholder="Customer" label={false} />
  </ReferenceInput>,
  <SelectInput key="status" source="status" choices={STATUS_CHOICES} />,
];

export default function Example() {
  return (
    <List
      resource="orders"
      sort={{ field: "date", order: "DESC" }}
      filters={filters}
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
