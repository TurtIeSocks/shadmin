import { ResourceContextProvider } from "shadmin-core";
import { ResourceMenuItem } from "shadmin/components/admin";
import { SidebarProvider, SidebarMenu } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <SidebarMenu>
        <ResourceContextProvider value="posts">
          <ResourceMenuItem name="posts" label="Posts" />
        </ResourceContextProvider>
      </SidebarMenu>
    </SidebarProvider>
  );
}
