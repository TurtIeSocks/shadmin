import { RecordContextProvider, Form } from "shadmin-core";
import { TextArrayInput } from "shadmin/components/admin";

export default function TextArrayInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, tags: ["react", "typescript"] }}>
      <Form>
        <TextArrayInput source="tags" />
      </Form>
    </RecordContextProvider>
  );
}
