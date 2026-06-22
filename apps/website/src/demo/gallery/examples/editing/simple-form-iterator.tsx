import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import {
  ArrayInput,
  NumberInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
} from "shadmin/components/admin";

// SimpleForm seeds defaultValues from the record; the iterator items need a
// ResourceContextProvider to mount.
const record = {
  id: 1,
  items: [
    { label: "Widget A", quantity: 2 },
    { label: "Widget B", quantity: 5 },
  ],
};

export default function SimpleFormIteratorExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={record}>
        <SimpleForm toolbar={false}>
          <ArrayInput source="items">
            <SimpleFormIterator>
              <TextInput source="label" />
              <NumberInput source="quantity" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
