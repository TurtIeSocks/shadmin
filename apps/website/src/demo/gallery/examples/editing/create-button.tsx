import { ResourceContextProvider } from "shadmin-core";
import { CreateButton } from "shadmin/components/admin";

export default function CreateButtonExample() {
  return (
    <ResourceContextProvider value="orders">
      <CreateButton />
    </ResourceContextProvider>
  );
}
