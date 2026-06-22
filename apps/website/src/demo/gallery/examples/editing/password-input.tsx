import { RecordContextProvider, Form } from "shadmin-core";
import { PasswordInput } from "shadmin/components/admin";

export default function PasswordInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, password: "" }}>
      <Form>
        <PasswordInput source="password" />
      </Form>
    </RecordContextProvider>
  );
}
