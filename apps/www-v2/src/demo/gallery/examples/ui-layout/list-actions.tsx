import { ResourceContextProvider } from "shadmin-core";
import { ListActions } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="orders">
      <ListActions hasCreate exporter={false} />
    </ResourceContextProvider>
  );
}
