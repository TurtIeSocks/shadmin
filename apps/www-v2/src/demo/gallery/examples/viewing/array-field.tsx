import { RecordContextProvider } from "shadmin-core";
import { ArrayField, ChipField } from "shadmin/components/admin";

export default function ArrayFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        tags: [{ name: "react" }, { name: "typescript" }, { name: "admin" }],
      }}
    >
      <ArrayField source="tags">
        <ChipField source="name" />
      </ArrayField>
    </RecordContextProvider>
  );
}
