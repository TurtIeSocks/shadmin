import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { PrevNextButtons } from "shadmin/components/admin";

export default function PrevNextButtonsExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 5 }}>
        <PrevNextButtons />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
