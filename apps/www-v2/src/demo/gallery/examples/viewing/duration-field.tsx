import { RecordContextProvider } from "shadmin-core";
import { DurationField } from "shadmin/components/admin";

export default function DurationFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, duration: 7384 }}>
      <DurationField source="duration" />
    </RecordContextProvider>
  );
}
