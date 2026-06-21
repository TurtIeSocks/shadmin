import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "shadmin/components/ui/sidebar";
import { Separator } from "shadmin/components/ui/separator";

interface SiteShellProps {
  /** The sidebar element — pass `<SiteSidebar>` (already contains SidebarRail). */
  sidebar: ReactNode;
  /**
   * Breadcrumb rendered in the inset header.
   * Also wrapped in `id="breadcrumb"` so the Demo's ra-core breadcrumb portal
   * has a mount target.
   */
  breadcrumb?: ReactNode;
  /** Right-aligned action buttons / controls in the inset header. */
  actions?: ReactNode;
  /** Controls the initial open state of SidebarProvider. Defaults to true. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Top-level shell shared by Docs and Demo.
 *
 * Renders:
 *   SidebarProvider
 *     {sidebar}          ← caller passes <SiteSidebar> (includes SidebarRail inside)
 *     SidebarInset
 *       header           ← SidebarTrigger | Separator | breadcrumb | actions
 *       {children}
 *
 * Note: SidebarRail is NOT rendered here — it must live inside <Sidebar> to access
 * useSidebar(). Pass a <SiteSidebar> (which includes <SidebarRail/>) as `sidebar`.
 */
export function SiteShell({
  sidebar,
  breadcrumb,
  actions,
  defaultOpen = true,
  children,
}: SiteShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {sidebar}
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="!h-4" />
          <div id="breadcrumb" className="flex flex-1 items-center gap-2">
            {breadcrumb}
          </div>
          {actions && (
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          )}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
