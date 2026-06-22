import { RecordContextProvider, Form } from "shadmin-core";
import { FileInput } from "shadmin/components/admin";

export default function FileInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, attachment: null }}>
      <Form>
        <FileInput source="attachment" />
      </Form>
    </RecordContextProvider>
  );
}
