import { LayoutDashboard, ShoppingCart, Users } from "lucide-react";
import { AppSidebar } from "shadmin/components/admin";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "shadmin/components/ui/sidebar";

// AppSidebar's default <Menu> renders resource links from the Admin registry
// (needs <Admin>); pass static children instead to show the real sidebar shell
// — brand header, collapsible body, footer — in isolation.
export default function Example() {
  return (
    // translateZ(0) makes this a containing block so the Sidebar's
    // `position: fixed` is trapped inside the preview box instead of escaping
    // to the viewport edge.
    <div
      className="relative h-80 overflow-hidden rounded-lg border"
      style={{ transform: "translateZ(0)" }}
    >
      <SidebarProvider>
        <AppSidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Users />
                <span>Customers</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ShoppingCart />
                <span>Orders</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </AppSidebar>
      </SidebarProvider>
    </div>
  );
}
