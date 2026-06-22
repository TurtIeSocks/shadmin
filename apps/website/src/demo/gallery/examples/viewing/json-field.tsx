import { RecordContextProvider } from "shadmin-core";
import { JsonField } from "shadmin/components/monaco";

export default function JsonFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        metadata: { plan: "pro", seats: 5, features: ["sso", "audit-log"] },
      }}
    >
      <JsonField source="metadata" />
    </RecordContextProvider>
  );
}
