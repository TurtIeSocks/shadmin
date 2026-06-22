import { RecordContextProvider, Form } from "shadmin-core";
import { DateTimeInput } from "shadmin/components/admin";

export default function DateTimeInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, published_at: "2024-01-15T10:30" }}>
      <Form>
        <DateTimeInput source="published_at" />
      </Form>
    </RecordContextProvider>
  );
}
