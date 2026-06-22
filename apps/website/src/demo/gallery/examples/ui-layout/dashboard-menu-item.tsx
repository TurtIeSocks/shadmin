import { DashboardMenuItem } from "shadmin/components/admin";
import { SidebarProvider, SidebarMenu } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <SidebarMenu>
        <DashboardMenuItem />
      </SidebarMenu>
    </SidebarProvider>
  );
}
