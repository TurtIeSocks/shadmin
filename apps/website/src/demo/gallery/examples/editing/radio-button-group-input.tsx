import { RecordContextProvider, Form } from "shadmin-core";
import { RadioButtonGroupInput } from "shadmin/components/admin";

const choices = [
  { id: "small", name: "Small" },
  { id: "medium", name: "Medium" },
  { id: "large", name: "Large" },
];

export default function RadioButtonGroupInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, size: "medium" }}>
      <Form>
        <RadioButtonGroupInput source="size" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
