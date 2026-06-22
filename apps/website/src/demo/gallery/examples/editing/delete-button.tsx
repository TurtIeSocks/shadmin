import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { DeleteButton } from "shadmin/components/admin";

export default function DeleteButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1, reference: "ORD-001" }}>
        <DeleteButton />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
