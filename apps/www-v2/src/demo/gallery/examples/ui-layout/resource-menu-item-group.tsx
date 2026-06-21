import { ResourceMenuItemGroup } from "shadmin/components/admin";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar variant="inset" collapsible="none" className="h-auto">
        <SidebarContent>
          <ResourceMenuItemGroup
            label="Catalog"
            resources={["products", "categories", "orders"]}
          />
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
