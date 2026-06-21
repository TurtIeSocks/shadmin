import { AppSidebar } from "shadmin/components/admin";
import { SidebarProvider } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <div className="h-80 overflow-hidden rounded border">
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </div>
  );
}
