import {
  AutocompleteInput,
  CreateButton,
  DataTable,
  ExportButton,
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

/**
 * Orders list — recent first, with customer reference resolved to a name and the
 * order total formatted as currency.
 */
export const OrdersList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filters={filters}
    perPage={25}
    actions={
      <div className="flex items-center gap-2">
        <CreateButton />
        <ExportButton />
      </div>
    }
  >
    <DataTable>
      <DataTable.Col source="reference" />
      <DataTable.Col
        source="customer_id"
        label="Customer"
        className="hidden md:table-cell"
      >
        <ReferenceField source="customer_id" reference="customers" />
      </DataTable.Col>
      <DataTable.Col
        source="date"
        render={(record) => new Date(record.date as string).toLocaleString()}
      />
      <DataTable.NumberCol
        source="total"
        options={{ style: "currency", currency: "USD" }}
        className="text-right"
      />
      <DataTable.Col source="status" />
    </DataTable>
  </List>
);
