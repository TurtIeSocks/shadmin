import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ReferenceField, TextField } from "shadmin/components/admin";

export default function ReferenceFieldExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider
        value={{ id: 1, customer_id: 1, reference: "ORD-001" }}
      >
        <ReferenceField source="customer_id" reference="customers">
          <TextField source="first_name" />
        </ReferenceField>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
