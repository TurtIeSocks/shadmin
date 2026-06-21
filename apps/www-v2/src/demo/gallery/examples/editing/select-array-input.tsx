import { RecordContextProvider, Form } from "shadmin-core";
import { SelectArrayInput } from "shadmin/components/admin";

const choices = [
  { id: "tech", name: "Tech" },
  { id: "news", name: "News" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "sports", name: "Sports" },
];

export default function SelectArrayInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, tags: ["tech", "news"] }}>
      <Form>
        <SelectArrayInput source="tags" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
