import { RecordContextProvider, Form } from "shadmin-core";
import { TimeInput } from "shadmin/components/admin";

export default function TimeInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, opens_at: "09:00" }}>
      <Form>
        <TimeInput source="opens_at" />
      </Form>
    </RecordContextProvider>
  );
}
