import { RecordContextProvider } from "shadmin-core";
import { ColorField } from "shadmin/components/admin";

export default function ColorFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, brand_color: "#6366f1" }}>
      <ColorField source="brand_color" />
    </RecordContextProvider>
  );
}
