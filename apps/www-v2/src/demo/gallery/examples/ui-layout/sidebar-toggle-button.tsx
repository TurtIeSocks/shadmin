import { SidebarToggleButton } from "shadmin/components/admin";
import { SidebarProvider } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <SidebarToggleButton />
    </SidebarProvider>
  );
}
