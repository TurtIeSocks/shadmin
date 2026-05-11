import { House } from "lucide-react";
import { useTranslate } from "ra-core";
import { MenuItemLink } from "@/components/admin/menu-item-link";

export type DashboardMenuItemProps = {
  /**
   * Extra CSS class appended to the underlying menu button.
   */
  className?: string;
  /**
   * Click handler invoked after the default navigation. Useful to close the
   * mobile drawer or trigger side effects.
   */
  onClick?: () => void;
};

/**
 * Sidebar entry linking to the dashboard (`/`).
 *
 * Renders only the dashboard link with the default House icon and a
 * translated label (`ra.page.dashboard`). The default `<AppSidebar>` uses
 * this component when an `<Admin dashboard>` is configured.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/dashboardmenuitem/ DashboardMenuItem documentation}
 *
 * @example
 * import { DashboardMenuItem } from "@/components/admin";
 *
 * const CustomMenu = () => (
 *   <nav>
 *     <DashboardMenuItem />
 *     ...
 *   </nav>
 * );
 */
export const DashboardMenuItem = ({
  className,
  onClick,
}: DashboardMenuItemProps) => {
  const translate = useTranslate();
  return (
    <MenuItemLink
      to="/"
      primaryText={translate("ra.page.dashboard", { _: "Dashboard" })}
      leftIcon={<House />}
      className={className}
      onClick={onClick}
    />
  );
};
