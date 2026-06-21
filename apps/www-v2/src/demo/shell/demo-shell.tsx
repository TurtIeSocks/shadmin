import { Layout } from "shadmin/components/admin";
import { Outlet } from "react-router";
import { DemoSidebar } from "./demo-sidebar";

/**
 * The flagship demo chrome: shadmin's `<Layout>` (AppBar + content area +
 * notifications + error boundary) wrapping the app/components/features zones,
 * with our custom 3-zone `<DemoSidebar>` in the sidebar slot.
 *
 * Mounted as a pathless layout route under `DemoLayout` so the bare `login` and
 * `launcher` routes stay chrome-free.
 */
export default function DemoShell() {
  return (
    <Layout sidebar={DemoSidebar}>
      <Outlet />
    </Layout>
  );
}
