import { ResourceContextProvider } from "shadmin-core";
import { ListButton } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="posts">
      <ListButton />
    </ResourceContextProvider>
  );
}
