import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { SimpleForm, TextInput, BooleanInput } from "shadmin/components/admin";

export default function SimpleFormExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider
        value={{ id: 1, reference: "ORD-001", returned: true }}
      >
        <SimpleForm>
          <TextInput source="reference" />
          <BooleanInput source="returned" />
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
