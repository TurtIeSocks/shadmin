import { RecordContextProvider, Form } from "shadmin-core";
import { NumberInput } from "shadmin/components/admin";

export default function NumberInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, views: 42 }}>
      <Form>
        <NumberInput source="views" />
      </Form>
    </RecordContextProvider>
  );
}
