import { RecordContextProvider } from "shadmin-core";
import { BooleanField } from "shadmin/components/admin";

export default function BooleanFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, is_published: true }}>
      <BooleanField source="is_published" />
    </RecordContextProvider>
  );
}
