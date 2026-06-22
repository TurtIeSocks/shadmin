import { Menu } from "shadmin/components/admin";
import { Settings, FileText } from "lucide-react";
import { SidebarProvider } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <Menu>
        <Menu.Item to="/posts" label="Posts" icon={<FileText />} />
        <Menu.Item to="/settings" label="Settings" icon={<Settings />} />
      </Menu>
    </SidebarProvider>
  );
}
