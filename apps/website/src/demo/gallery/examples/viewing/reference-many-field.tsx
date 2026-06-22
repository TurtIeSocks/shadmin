import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ReferenceManyField, DataTable } from "shadmin/components/admin";

export default function ReferenceManyFieldExample() {
  return (
    <ResourceContextProvider value="customers">
      <RecordContextProvider
        value={{ id: 1, first_name: "Jane", last_name: "Doe" }}
      >
        <ReferenceManyField
          reference="orders"
          target="customer_id"
          perPage={5}
          loading={
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          }
          empty={
            <p className="text-sm text-muted-foreground">No orders found.</p>
          }
        >
          <DataTable>
            <DataTable.Col source="reference" />
            <DataTable.Col source="status" />
            <DataTable.Col source="total_ex_taxes" label="Total" />
          </DataTable>
        </ReferenceManyField>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
