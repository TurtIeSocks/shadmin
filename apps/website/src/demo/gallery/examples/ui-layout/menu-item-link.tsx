import { MenuItemLink } from "shadmin/components/admin";
import { FileText, Settings } from "lucide-react";
import { SidebarProvider, SidebarMenu } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <SidebarMenu>
        <MenuItemLink to="/posts" label="Posts" icon={<FileText />} />
        <MenuItemLink to="/settings" label="Settings" icon={<Settings />} />
      </SidebarMenu>
    </SidebarProvider>
  );
}
