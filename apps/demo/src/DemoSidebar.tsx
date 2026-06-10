import { Link } from "react-router";
import { DatabaseIcon, Shell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "shadcn-admin-kit/components/ui/sidebar";
import { DashboardMenuItem } from "shadcn-admin-kit/components/admin/dashboard-menu-item";
import { ResourceMenuItemGroup } from "shadcn-admin-kit/components/admin/resource-menu-item-group";

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
        label="Catalog"
        resources={["products", "categories"]}
      />
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Products (schema)">
                <Link to="/products/schema-view">
                  <DatabaseIcon className="size-4" />
                  <span>Products (schema)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <ResourceMenuItemGroup
        label="Sales"
        resources={["orders", "customers", "reviews", "segments"]}
      />
      <ResourceMenuItemGroup
        label="SaaS"
        resources={["subscriptions", "api_keys", "webhooks"]}
      />
      <ResourceMenuItemGroup
        label="Workflow"
        resources={["approvals", "scheduled_jobs"]}
      />
      <ResourceMenuItemGroup
        label="Analytics"
        resources={["reports", "tasks", "places"]}
      />
      <ResourceMenuItemGroup
        label="Setup"
        resources={["onboardings", "documents"]}
      />
      <ResourceMenuItemGroup resources={["component_gallery"]} />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
);
