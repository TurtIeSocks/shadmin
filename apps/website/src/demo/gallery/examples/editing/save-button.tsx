import { RecordContextProvider, Form } from "shadmin-core";
import { SaveButton } from "shadmin/components/admin";

export default function SaveButtonExample() {
  return (
    <RecordContextProvider value={{ id: 1, title: "Hello world" }}>
      <Form>
        <SaveButton />
      </Form>
    </RecordContextProvider>
  );
}
