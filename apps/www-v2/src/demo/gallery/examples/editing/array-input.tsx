import { RecordContextProvider, Form } from "shadmin-core";
import {
  ArrayInput,
  SimpleFormIterator,
  TextInput,
} from "shadmin/components/admin";

export default function ArrayInputExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, tags: [{ name: "tech" }, { name: "news" }] }}
    >
      <Form>
        <ArrayInput source="tags">
          <SimpleFormIterator>
            <TextInput source="name" />
          </SimpleFormIterator>
        </ArrayInput>
      </Form>
    </RecordContextProvider>
  );
}
