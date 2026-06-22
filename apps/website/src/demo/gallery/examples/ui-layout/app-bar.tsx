import { AppBar } from "shadmin/components/admin";
import { SidebarProvider } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <div className="w-full">
        <AppBar userMenu={false} toolbar={null} />
      </div>
    </SidebarProvider>
  );
}
