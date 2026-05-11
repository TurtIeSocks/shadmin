import type { ReactNode } from "react";
import { useHasDashboard, useResourceDefinitions } from "ra-core";
import { SidebarMenu } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { DashboardMenuItem } from "@/components/admin/dashboard-menu-item";
import { MenuItemLink } from "@/components/admin/menu-item-link";
import { ResourceMenuItem } from "@/components/admin/resource-menu-item";

export type MenuProps = {
  /**
   * When provided, replaces the default resource-list rendering. Use
   * `<Menu.Item>`, `<Menu.DashboardItem>` and `<Menu.ResourceItem>` as
   * children.
   */
  children?: ReactNode;
  /**
   * Extra CSS class appended to the wrapping `<SidebarMenu>`.
   */
  className?: string;
};

/**
 * Renders the sidebar menu: a dashboard link (if defined) followed by one
 * link per resource that exposes a list view.
 *
 * `<Menu>` is the building block of the default `<AppSidebar>`. Pass
 * children to replace the auto-generated entries with a custom list.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/menu/ Menu documentation}
 *
 * @example // Use the default resource-based menu
 * import { Menu } from "@/components/admin";
 *
 * const Sidebar = () => <Menu />;
 *
 * @example // Define a custom menu
 * import { Settings, Book } from "lucide-react";
 * import { Menu } from "@/components/admin";
 *
 * const Sidebar = () => (
 *   <Menu>
 *     <Menu.DashboardItem />
 *     <Menu.ResourceItem name="posts" />
 *     <Menu.Item to="/settings" primaryText="Settings" leftIcon={<Settings />} />
 *     <Menu.Item to="/books" primaryText="Books" leftIcon={<Book />} />
 *   </Menu>
 * );
 */
export const Menu = ({ children, className }: MenuProps) => {
  const hasDashboard = useHasDashboard();
  const resources = useResourceDefinitions();
  return (
    <SidebarMenu className={cn(className)}>
      {children ?? (
        <>
          {hasDashboard ? <DashboardMenuItem /> : null}
          {Object.keys(resources)
            .filter((name) => resources[name].hasList)
            .map((name) => (
              <ResourceMenuItem key={name} name={name} />
            ))}
        </>
      )}
    </SidebarMenu>
  );
};

// re-export menu pieces for convenience (mirrors the upstream react-admin API)
Menu.Item = MenuItemLink;
Menu.DashboardItem = DashboardMenuItem;
Menu.ResourceItem = ResourceMenuItem;
