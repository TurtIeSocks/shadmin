import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { UpdateButton } from "shadmin/components/admin";

export default function UpdateButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <RecordContextProvider value={{ id: 1, status: "draft" }}>
        <UpdateButton label="Activate" data={{ status: "active" }} />
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
