import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarToggleButton, ThemeProvider } from "@/components/admin";

export default {
  title: "Layout/SidebarToggleButton",
};

export const Basic = () => (
  <ThemeProvider>
    <SidebarProvider>
      <SidebarToggleButton />
    </SidebarProvider>
  </ThemeProvider>
);

export const CustomClass = () => (
  <ThemeProvider>
    <SidebarProvider>
      <SidebarToggleButton className="size-10" />
    </SidebarProvider>
  </ThemeProvider>
);
