import { LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "shadmin/components/ui/sidebar";
import { demoResources } from "../app/resources";

/**
 * Returns an `isActive(to, exact?)` predicate bound to the current pathname.
 * Exact matches the Dashboard link (`/demo/app`); prefix matches a resource
 * and its sub-pages (`/demo/app/orders`, `/demo/app/orders/3`, …).
 */
function useIsActive() {
  const { pathname: current } = useLocation();
  return (to: string, exact = false) =>
    exact ? current === to : current === to || current.startsWith(`${to}/`);
}

/**
 * The demo's 3-zone sidebar content — designed to be passed as children of
 * `<SiteSidebar>` (which provides the surrounding `<Sidebar>` shell).
 *
 * Zones:
 * - **App** — Dashboard link + the six demo resources from `demoResources`.
 * - **Components** — placeholder (filled in Phase 2 from the gallery tree).
 * - **Features** — placeholder (filled in Phase 3).
 */
export function DemoSidebarContent() {
  const isActive = useIsActive();

  return (
    <>
      {/* --- App zone ------------------------------------------------- */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          App
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/demo/app", true)}>
                <Link to="/demo/app">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {Object.entries(demoResources).map(([name, resource]) => {
              const to = `/demo/app/${name}`;
              return (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton asChild isActive={isActive(to)}>
                    <Link to={to}>
                      {resource.icon}
                      <span>{resource.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* --- Components zone (placeholder) ---------------------------- */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          Components
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Coming soon
          </p>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* --- Features zone (placeholder) ----------------------------- */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          Features
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Coming soon
          </p>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
