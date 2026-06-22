import { ResourceContextProvider } from "shadmin-core";
import { Empty } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="orders">
      <Empty hasCreate={false} />
    </ResourceContextProvider>
  );
}
