import { ResourceContextProvider } from "shadmin-core";
import { ListNoResults } from "shadmin/components/admin";

export default function Example() {
  return (
    <ResourceContextProvider value="orders">
      <ListNoResults filterValues={{ status: "draft" }} setFilters={() => {}} />
    </ResourceContextProvider>
  );
}
