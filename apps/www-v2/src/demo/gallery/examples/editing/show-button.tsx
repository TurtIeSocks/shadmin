import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ShowButton } from "shadmin/components/admin";

export default function ShowButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1, reference: "ORD-001" }}>
        <ShowButton />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
