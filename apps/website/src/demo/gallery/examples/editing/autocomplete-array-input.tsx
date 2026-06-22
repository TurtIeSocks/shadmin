import { RecordContextProvider, Form } from "shadmin-core";
import { AutocompleteArrayInput } from "shadmin/components/admin";

const choices = [
  { id: "react", name: "React" },
  { id: "vue", name: "Vue" },
  { id: "angular", name: "Angular" },
  { id: "svelte", name: "Svelte" },
];

export default function AutocompleteArrayInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, frameworks: ["react"] }}>
      <Form>
        <AutocompleteArrayInput source="frameworks" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
