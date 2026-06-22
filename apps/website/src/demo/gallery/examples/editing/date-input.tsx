import { RecordContextProvider, Form } from "shadmin-core";
import { DateInput } from "shadmin/components/admin";

export default function DateInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, created_at: "2024-01-15" }}>
      <Form>
        <DateInput source="created_at" />
      </Form>
    </RecordContextProvider>
  );
}
