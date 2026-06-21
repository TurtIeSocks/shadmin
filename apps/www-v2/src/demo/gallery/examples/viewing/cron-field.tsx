import { RecordContextProvider } from "shadmin-core";
import { CronField } from "shadmin/components/admin";

export default function CronFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, schedule: "0 9 * * 1-5" }}>
      <CronField source="schedule" showExpression />
    </RecordContextProvider>
  );
}
