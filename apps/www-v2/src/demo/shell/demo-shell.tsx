import { Outlet } from "react-router";
import { SiteShell } from "@/components/site-shell/site-shell";
import { SiteSidebar } from "@/components/site-shell/site-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoSidebarContent } from "./demo-sidebar";

/**
 * The flagship demo chrome: SiteShell (shared with Docs) wrapping the
 * 3-zone DemoSidebarContent inside SiteSidebar.
 *
 * Breadcrumb is omitted here — the ra-core breadcrumb portal used by the
 * flagship pages targets the `id="breadcrumb"` div that SiteShell always
 * renders in the inset header, so no static fallback is needed.
 *
 * Mounted as a pathless layout route under DemoLayout so the bare `login`
 * and `launcher` routes stay chrome-free.
 */
export default function DemoShell() {
  return (
    <SiteShell
      sidebar={
        <SiteSidebar>
          <DemoSidebarContent />
        </SiteSidebar>
      }
      actions={<ThemeToggle />}
    >
      <Outlet />
    </SiteShell>
  );
}
