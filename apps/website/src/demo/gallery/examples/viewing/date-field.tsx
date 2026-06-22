import { RecordContextProvider } from "shadmin-core";
import { DateField } from "shadmin/components/admin";

export default function DateFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, created_at: "2024-03-15T10:30:00Z" }}
    >
      <DateField source="created_at" showTime />
    </RecordContextProvider>
  );
}
