import { RecordContextProvider, Form } from "shadmin-core";
import { CheckboxGroupInput } from "shadmin/components/admin";

const choices = [
  { id: "read", name: "Read" },
  { id: "write", name: "Write" },
  { id: "admin", name: "Admin" },
];

export default function CheckboxGroupInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, permissions: ["read", "write"] }}>
      <Form>
        <CheckboxGroupInput source="permissions" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
