import { RecordContextProvider } from "shadmin-core";
import { SelectField } from "shadmin/components/admin";

const statusChoices = [
  { id: "draft", name: "Draft" },
  { id: "published", name: "Published" },
  { id: "archived", name: "Archived" },
];

export default function SelectFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, status: "published" }}>
      <SelectField source="status" choices={statusChoices} />
    </RecordContextProvider>
  );
}
