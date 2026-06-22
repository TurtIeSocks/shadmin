import { RecordContextProvider, Form } from "shadmin-core";
import { TextInput } from "shadmin/components/admin";

export default function TextInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, title: "Hello world" }}>
      <Form>
        <TextInput source="title" />
      </Form>
    </RecordContextProvider>
  );
}
