import { RecordContextProvider } from "shadmin-core";
import { DurationField } from "shadmin/components/admin";

export default function DurationFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, duration: "PT2H3M4S" }}>
      <DurationField source="duration" />
    </RecordContextProvider>
  );
}
