import { RecordContextProvider, Form } from "shadmin-core";
import { SelectInput } from "shadmin/components/admin";

const choices = [
  { id: "draft", name: "Draft" },
  { id: "active", name: "Active" },
  { id: "archived", name: "Archived" },
];

export default function SelectInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, status: "active" }}>
      <Form>
        <SelectInput source="status" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
