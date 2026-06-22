import { RecordContextProvider } from "shadmin-core";
import { NumberField } from "shadmin/components/admin";

export default function NumberFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, views: 12450 }}>
      <NumberField source="views" options={{ notation: "compact" }} />
    </RecordContextProvider>
  );
}
