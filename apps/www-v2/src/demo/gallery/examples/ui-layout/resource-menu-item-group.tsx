import { ResourceMenuItemGroup } from "shadmin/components/admin";
import { SidebarProvider } from "shadmin/components/ui/sidebar";

export default function Example() {
  return (
    <SidebarProvider>
      <ResourceMenuItemGroup
        label="Catalog"
        resources={["products", "categories", "orders"]}
      />
    </SidebarProvider>
  );
}
