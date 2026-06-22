import { RecordContextProvider } from "shadmin-core";
import { EmailField } from "shadmin/components/admin";

export default function EmailFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, email: "jane@example.com" }}>
      <EmailField source="email" />
    </RecordContextProvider>
  );
}
