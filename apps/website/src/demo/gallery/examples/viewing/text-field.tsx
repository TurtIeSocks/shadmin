import { RecordContextProvider } from "shadmin-core";
import { TextField } from "shadmin/components/admin";

export default function TextFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, name: "Jane Doe" }}>
      <TextField source="name" />
    </RecordContextProvider>
  );
}
