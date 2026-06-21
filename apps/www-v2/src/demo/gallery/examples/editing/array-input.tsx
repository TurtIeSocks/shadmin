import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import {
  ArrayInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
} from "shadmin/components/admin";

// SimpleForm (not a bare Form) seeds its defaultValues from the record, and the
// iterator items require a ResourceContextProvider (see SimpleFormIterator src).
const record = { id: 1, tags: [{ name: "tech" }, { name: "news" }] };

export default function ArrayInputExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={record}>
        <SimpleForm toolbar={false}>
          <ArrayInput source="tags">
            <SimpleFormIterator>
              <TextInput source="name" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
