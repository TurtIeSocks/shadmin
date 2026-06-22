import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { CloneButton } from "shadmin/components/admin";

export default function CloneButtonExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={{ id: 1, name: "Widget Pro" }}>
        <CloneButton />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
