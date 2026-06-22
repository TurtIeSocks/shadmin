import { RecordContextProvider, Form } from "shadmin-core";
import { BooleanInput } from "shadmin/components/admin";

export default function BooleanInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, is_published: true }}>
      <Form>
        <BooleanInput source="is_published" />
      </Form>
    </RecordContextProvider>
  );
}
