import { RecordContextProvider, Form } from "shadmin-core";
import { CronInput } from "shadmin/components/admin";

export default function CronInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, schedule: "0 9 * * 1-5" }}>
      <Form>
        <CronInput source="schedule" />
      </Form>
    </RecordContextProvider>
  );
}
