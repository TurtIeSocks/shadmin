import { ResourceContextProvider } from "shadmin-core";
import { ListToolbar } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="posts">
      <ListToolbar hasCreate exporter={false} />
    </ResourceContextProvider>
  );
}
