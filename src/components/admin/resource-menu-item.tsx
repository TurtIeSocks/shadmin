import { createElement } from "react";
import { Link, useMatch } from "react-router";
import {
  useCanAccess,
  useCreatePath,
  useGetResourceLabel,
  useResourceDefinitions,
} from "ra-core";
import { List } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export type ResourceMenuItemProps = {
  /**
   * The resource name (matches the `name` of a `<Resource>` registered in `<Admin>`).
   * Used to look up the resource definition, label, icon and list path.
   */
  name: string;
  /**
   * Extra CSS class appended to the underlying menu button.
   */
  className?: string;
  /**
   * Click handler invoked after the default navigation. The default
   * `<AppSidebar>` uses this to close the mobile drawer.
   */
  onClick?: () => void;
};

/**
 * Sidebar entry linking to a resource list view.
 *
 * Resolves the resource definition (label, icon, list path) and renders a
 * `<SidebarMenuItem>` that navigates to the list view. Returns `null` when
 * the current user does not have `list` access via `useCanAccess`. Shows a
 * `<Skeleton>` while the permission check is pending.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/resourcemenuitem/ ResourceMenuItem documentation}
 *
 * @example
 * import { ResourceMenuItem } from "@/components/admin";
 *
 * const CustomSidebarMenu = () => (
 *   <nav>
 *     <ResourceMenuItem name="posts" />
 *     <ResourceMenuItem name="comments" />
 *   </nav>
 * );
 */
export const ResourceMenuItem = ({
  name,
  className,
  onClick,
}: ResourceMenuItemProps) => {
  const { canAccess, isPending } = useCanAccess({
    resource: name,
    action: "list",
  });
  const resources = useResourceDefinitions();
  const getResourceLabel = useGetResourceLabel();
  const createPath = useCreatePath();
  const to = createPath({ resource: name, type: "list" });
  const match = useMatch({ path: to, end: false });
  const { openMobile, setOpenMobile } = useSidebar();

  if (isPending) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!resources || !resources[name] || !canAccess) return null;

  const handleClick = () => {
    if (openMobile) {
      setOpenMobile(false);
    }
    onClick?.();
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} className={className}>
        <Link to={to} state={{ _scrollToTop: true }} onClick={handleClick}>
          {resources[name].icon ? (
            createElement(resources[name].icon)
          ) : (
            <List />
          )}
          {getResourceLabel(name, 2)}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
