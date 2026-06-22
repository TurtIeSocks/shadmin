import { RecordContextProvider } from "shadmin-core";
import { MonacoJsonField } from "shadmin/components/monaco";

export default function MonacoJsonFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        config: { theme: "dark", language: "en", notifications: true },
      }}
    >
      <MonacoJsonField source="config" />
    </RecordContextProvider>
  );
}
