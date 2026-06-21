import { RecordContextProvider, Form } from "shadmin-core";
import {
  ArrayInput,
  SimpleFormIterator,
  TextInput,
} from "shadmin/components/admin";

const defaultValues = { tags: [{ name: "tech" }, { name: "news" }] };

export default function ArrayInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, ...defaultValues }}>
      <Form defaultValues={defaultValues}>
        <ArrayInput source="tags">
          <SimpleFormIterator>
            <TextInput source="name" />
          </SimpleFormIterator>
        </ArrayInput>
      </Form>
    </RecordContextProvider>
  );
}
