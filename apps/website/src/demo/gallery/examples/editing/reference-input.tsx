import {
  RecordContextProvider,
  Form,
  ResourceContextProvider,
} from "shadmin-core";
import { ReferenceInput, AutocompleteInput } from "shadmin/components/admin";

export default function ReferenceInputExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1, customer_id: 1 }}>
        <Form>
          <ReferenceInput source="customer_id" reference="customers">
            <AutocompleteInput optionText="last_name" />
          </ReferenceInput>
        </Form>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
