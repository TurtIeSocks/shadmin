import { RecordContextProvider, Form } from "shadmin-core";
import {
  ArrayInput,
  SimpleFormIterator,
  TextInput,
  NumberInput,
} from "shadmin/components/admin";

export default function SimpleFormIteratorExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        items: [
          { label: "Widget A", quantity: 2 },
          { label: "Widget B", quantity: 5 },
        ],
      }}
    >
      <Form>
        <ArrayInput source="items">
          <SimpleFormIterator>
            <TextInput source="label" />
            <NumberInput source="quantity" />
          </SimpleFormIterator>
        </ArrayInput>
      </Form>
    </RecordContextProvider>
  );
}
