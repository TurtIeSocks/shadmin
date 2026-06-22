import {
  DataTable,
  InfiniteList,
  ReferenceField,
} from "shadmin/components/admin";

export default function Example() {
  return (
    <InfiniteList resource="orders" sort={{ field: "date", order: "DESC" }}>
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
    </InfiniteList>
  );
}
