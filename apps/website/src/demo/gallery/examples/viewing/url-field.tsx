import { RecordContextProvider } from "shadmin-core";
import { UrlField } from "shadmin/components/admin";

export default function UrlFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, website: "https://example.com" }}>
      <UrlField source="website" />
    </RecordContextProvider>
  );
}
