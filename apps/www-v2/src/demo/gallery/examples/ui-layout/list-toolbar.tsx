import { ResourceContextProvider } from "shadmin-core";
import { ListToolbar } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="orders">
      <ListToolbar hasCreate exporter={false} />
    </ResourceContextProvider>
  );
}
