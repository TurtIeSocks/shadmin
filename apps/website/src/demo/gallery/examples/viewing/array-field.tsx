import { RecordContextProvider } from "shadmin-core";
import {
  ArrayField,
  SingleFieldList,
  ChipField,
} from "shadmin/components/admin";

export default function ArrayFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        tags: [{ name: "react" }, { name: "typescript" }, { name: "admin" }],
      }}
    >
      <ArrayField source="tags">
        <SingleFieldList>
          <ChipField source="name" />
        </SingleFieldList>
      </ArrayField>
    </RecordContextProvider>
  );
}
