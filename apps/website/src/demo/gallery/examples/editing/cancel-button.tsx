import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { CancelButton } from "shadmin/components/admin";

export default function CancelButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1 }}>
        <CancelButton />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
