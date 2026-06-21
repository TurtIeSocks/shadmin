import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import {
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
} from "shadmin/components/admin";

export default function ReferenceArrayFieldExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={{ id: 1, tag_ids: [1, 2, 3] }}>
        <ReferenceArrayField source="tag_ids" reference="tags">
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
