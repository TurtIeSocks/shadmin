import { RecordContextProvider } from "shadmin-core";
import { BadgeField } from "shadmin/components/admin";

export default function BadgeFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, status: "published" }}>
      <BadgeField source="status" />
    </RecordContextProvider>
  );
}
