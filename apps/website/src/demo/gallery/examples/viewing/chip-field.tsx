import { RecordContextProvider } from "shadmin-core";
import { ChipField } from "shadmin/components/admin";

export default function ChipFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, category: "electronics" }}>
      <ChipField source="category" />
    </RecordContextProvider>
  );
}
