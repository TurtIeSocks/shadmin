import { RecordContextProvider, Form } from "shadmin-core";
import { ResettableTextInput } from "shadmin/components/admin";

export default function ResettableTextInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, search: "react admin" }}>
      <Form>
        <ResettableTextInput source="search" />
      </Form>
    </RecordContextProvider>
  );
}
