import { RecordContextProvider, Form } from "shadmin-core";
import { AutocompleteInput } from "shadmin/components/admin";

const choices = [
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "gb", name: "United Kingdom" },
  { id: "us", name: "United States" },
];

export default function AutocompleteInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, country: "fr" }}>
      <Form>
        <AutocompleteInput source="country" choices={choices} />
      </Form>
    </RecordContextProvider>
  );
}
