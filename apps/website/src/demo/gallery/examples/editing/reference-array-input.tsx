import {
  RecordContextProvider,
  Form,
  ResourceContextProvider,
} from "shadmin-core";
import {
  ReferenceArrayInput,
  AutocompleteArrayInput,
} from "shadmin/components/admin";

export default function ReferenceArrayInputExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={{ id: 1, tag_ids: [1, 2] }}>
        <Form>
          <ReferenceArrayInput source="tag_ids" reference="tags">
            <AutocompleteArrayInput optionText="name" />
          </ReferenceArrayInput>
        </Form>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
