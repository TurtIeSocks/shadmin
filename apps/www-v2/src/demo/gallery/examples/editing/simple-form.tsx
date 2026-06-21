import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { SimpleForm, TextInput, BooleanInput } from "shadmin/components/admin";

export default function SimpleFormExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider
        value={{ id: 1, reference: "ORD-001", status: "active" }}
      >
        <SimpleForm>
          <TextInput source="reference" />
          <BooleanInput source="status" />
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
