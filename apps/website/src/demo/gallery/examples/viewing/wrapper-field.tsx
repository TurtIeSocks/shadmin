import { RecordContextProvider } from "shadmin-core";
import { WrapperField, TextField, EmailField } from "shadmin/components/admin";

export default function WrapperFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, name: "Jane Doe", email: "jane@example.com" }}
    >
      <WrapperField label="Contact">
        <TextField source="name" />
        {" — "}
        <EmailField source="email" />
      </WrapperField>
    </RecordContextProvider>
  );
}
