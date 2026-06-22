import { RecordContextProvider, Form } from "shadmin-core";
import { NullableBooleanInput } from "shadmin/components/admin";

export default function NullableBooleanInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, verified: null }}>
      <Form>
        <NullableBooleanInput source="verified" />
      </Form>
    </RecordContextProvider>
  );
}
