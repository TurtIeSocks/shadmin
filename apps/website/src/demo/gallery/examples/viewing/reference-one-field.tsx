import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ReferenceOneField, TextField } from "shadmin/components/admin";

export default function ReferenceOneFieldExample() {
  return (
    <ResourceContextProvider value="customers">
      <RecordContextProvider
        value={{ id: 1, first_name: "Jane", last_name: "Doe" }}
      >
        <ReferenceOneField
          reference="orders"
          target="customer_id"
          label="Latest order"
          loading={<p className="text-sm text-muted-foreground">Loading…</p>}
          empty={
            <p className="text-sm text-muted-foreground">No order found.</p>
          }
        >
          <TextField source="reference" />
        </ReferenceOneField>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
