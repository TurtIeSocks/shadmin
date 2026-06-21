import { RecordContextProvider, Form } from "shadmin-core";
import { LoadingInput } from "shadmin/components/admin";

export default function LoadingInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, name: "" }}>
      <Form>
        <LoadingInput source="name" />
      </Form>
    </RecordContextProvider>
  );
}
