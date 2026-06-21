import { LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Brand } from "@/components/brand";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
 * The demo's flagship sidebar: three zones.
 *
 * - **App** — the six demo resources (links to `/demo/app/<name>`) plus a
 *   Dashboard link to `/demo/app`. Driven off the same `demoResources` registry
 *   the routes use, so nav and routing never drift.
 * - **Components** — placeholder (filled in Task 9 from the gallery tree).
 * - **Features** — placeholder (filled in Phase 3).
 *
 * Built from the same `shadmin/components/ui/sidebar` primitives the docs
 * sidebar uses. Rendered as the `sidebar` slot of shadmin's `<Layout>`, which
 * supplies the surrounding `<SidebarProvider>`.
 */
export function DemoSidebar() {
  const isActive = useIsActive();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-0">
        <div className="flex h-14 items-center px-4">
          <Link to="/demo/app" className="text-base">
            <Brand />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-4">
        {/* --- App zone ------------------------------------------------- */}
        <SidebarGroup className="py-0.5">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
            App
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/demo/app", true)}
                >
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
      </SidebarContent>
    </Sidebar>
  );
}
