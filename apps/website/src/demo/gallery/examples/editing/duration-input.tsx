import { RecordContextProvider, Form } from "shadmin-core";
import { DurationInput } from "shadmin/components/admin";

export default function DurationInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, duration: "PT2H30M" }}>
      <Form>
        <DurationInput source="duration" />
      </Form>
    </RecordContextProvider>
  );
}
