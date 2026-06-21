import {
  DataTable,
  ExportButton,
  List,
  ReferenceField,
} from "shadmin/components/admin";

export default function Example() {
  return (
    <List
      resource="orders"
      sort={{ field: "date", order: "DESC" }}
      perPage={10}
      actions={
        <div className="flex items-center gap-2">
          <ExportButton />
        </div>
      }
    >
      <DataTable>
        <DataTable.Col source="reference" />
        <DataTable.Col source="customer_id" label="Customer">
          <ReferenceField source="customer_id" reference="customers" />
        </DataTable.Col>
        <DataTable.Col
          source="date"
          render={(record) => new Date(record.date as string).toLocaleString()}
        />
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
