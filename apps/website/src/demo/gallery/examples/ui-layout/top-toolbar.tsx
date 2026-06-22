import {
  TopToolbar,
  CreateButton,
  RefreshButton,
} from "shadmin/components/admin";
import { ResourceContextProvider } from "shadmin-core";

export default function Example() {
  return (
    <ResourceContextProvider value="products">
      <TopToolbar>
        <CreateButton />
        <RefreshButton />
      </TopToolbar>
    </ResourceContextProvider>
  );
}
