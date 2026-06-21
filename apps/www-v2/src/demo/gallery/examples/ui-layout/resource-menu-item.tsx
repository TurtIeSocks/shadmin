import { ResourceMenuItem } from "shadmin/components/admin";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
} from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar variant="inset" collapsible="none" className="h-auto">
        <SidebarContent>
          <SidebarMenu>
            <ResourceMenuItem name="products" label="Products" />
            <ResourceMenuItem name="orders" label="Orders" />
            <ResourceMenuItem name="customers" label="Customers" />
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
