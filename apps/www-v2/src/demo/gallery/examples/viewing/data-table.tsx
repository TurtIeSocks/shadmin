import { List, DataTable, NumberField } from "shadmin/components/admin";

export default function DataTableOverviewExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
        <DataTable.Col source="total_ex_taxes" label="Total">
          <NumberField
            source="total_ex_taxes"
            options={{ style: "currency", currency: "USD" }}
          />
        </DataTable.Col>
        <DataTable.Col source="customer_id" label="Customer" />
      </DataTable>
    </List>
  );
}
