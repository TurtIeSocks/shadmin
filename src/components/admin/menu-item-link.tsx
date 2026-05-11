import type { ReactNode } from "react";
import { Link, useMatch } from "react-router";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type MenuItemLinkProps = {
  /**
   * Target path for the link. Compared against the current location to
   * derive the active state.
   */
  to: string;
  /**
   * The text rendered alongside `leftIcon`. Strings are not auto-translated;
   * pass a `<Translate>` element to localize.
   */
  primaryText: ReactNode;
  /**
   * Icon rendered before `primaryText`. Pass a `lucide-react` icon (or any
   * ReactNode) sized to match other sidebar items.
   */
  leftIcon?: ReactNode;
  /**
   * Extra CSS class appended to the underlying `<SidebarMenuButton>`.
   */
  className?: string;
  /**
   * Click handler invoked after the default navigation. The default
   * `<AppSidebar>` uses this to close the mobile drawer.
   */
  onClick?: () => void;
};

/**
 * A clickable sidebar entry that navigates to a route.
 *
 * `<MenuItemLink>` renders a sidebar item with an icon and a label that
 * navigates via react-router. It is the building block for custom sidebar
 * menus and is used internally by `<DashboardMenuItem>`.
 *
 * The active state is derived from `useMatch`; when the current pathname
 * starts with `to`, the item is highlighted.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/menuitemlink/ MenuItemLink documentation}
 *
 * @example
 * import { Settings } from "lucide-react";
 * import { MenuItemLink } from "@/components/admin";
 *
 * const SettingsItem = () => (
 *   <MenuItemLink
 *     to="/settings"
 *     primaryText="Settings"
 *     leftIcon={<Settings />}
 *   />
 * );
 */
export const MenuItemLink = ({
  to,
  primaryText,
  leftIcon,
  className,
  onClick,
}: MenuItemLinkProps) => {
  const match = useMatch({ path: to, end: to === "/" });
  const { openMobile, setOpenMobile } = useSidebar();
  const handleClick = () => {
    if (openMobile) {
      setOpenMobile(false);
    }
    onClick?.();
  };
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} className={className}>
        <Link to={to} onClick={handleClick}>
          {leftIcon}
          {primaryText}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
