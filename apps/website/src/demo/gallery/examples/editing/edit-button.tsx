import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { EditButton } from "shadmin/components/admin";

export default function EditButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1, reference: "ORD-001" }}>
        <EditButton />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
