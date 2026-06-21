import type { ReactNode, CSSProperties } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "shadmin/components/ui/sidebar";
import { SectionSwitcher } from "@/components/site-shell/section-switcher";

interface SiteSidebarProps {
  /** Replaces the default `<SectionSwitcher />` in the sidebar header. */
  header?: ReactNode;
  /** Navigation content rendered in the sidebar body. */
  children?: ReactNode;
  /** Optional footer content (e.g. NavUser). */
  footer?: ReactNode;
}

/**
 * Shared floating sidebar shell used by both Docs and Demo layouts.
 * Renders as `variant="floating" collapsible="icon"`.
 * `SidebarRail` lives here (requires Sidebar context from useSidebar).
 */
export function SiteSidebar({ header, children, footer }: SiteSidebarProps) {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3.5rem",
        } as CSSProperties
      }
    >
      <SidebarHeader>{header ?? <SectionSwitcher />}</SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
