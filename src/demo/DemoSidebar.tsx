import { Link } from "react-router";
import { Shell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DashboardMenuItem } from "@/components/admin/dashboard-menu-item";
import { ResourceMenuItemGroup } from "@/components/admin/resource-menu-item-group";

/**
 * Demo sidebar that hand-composes `<ResourceMenuItemGroup>` instead of
 * deferring to the auto-grouped `<Menu>`.
 *
 * Mirrors the default `<AppSidebar>` shell but spells out each section, so
 * contributors can copy/paste this as a starting point when they need a
 * custom navigation order, conditional groups, or extra non-resource entries
 * between groups.
 */
export const DemoSidebar = () => (
  <Sidebar variant="floating" collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="data-[slot=sidebar-menu-button]:p-1.5!"
          >
            <Link to="/">
              <Shell className="size-5!" />
              <span className="text-base font-semibold">Acme Inc.</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <DashboardMenuItem />
      </SidebarMenu>
      <ResourceMenuItemGroup
        label="Sales"
        resources={["orders", "customers"]}
      />
      <ResourceMenuItemGroup
        label="Catalog"
        resources={["products", "categories"]}
      />
      <ResourceMenuItemGroup label="Content" resources={["reviews"]} />
      <ResourceMenuItemGroup label="Map" resources={["places"]} />
      <ResourceMenuItemGroup label="Planning" resources={["tasks"]} />
      <ResourceMenuItemGroup label="Analytics" resources={["reports"]} />
      <ResourceMenuItemGroup label="Workspace" resources={["documents"]} />
      <ResourceMenuItemGroup label="System" resources={["onboardings"]} />
      <ResourceMenuItemGroup resources={["component_gallery"]} />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
);
