import { ResourceContextProvider } from "shadmin-core";
import { Empty } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="posts">
      <Empty hasCreate={false} />
    </ResourceContextProvider>
  );
}
