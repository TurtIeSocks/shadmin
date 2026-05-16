import type { PropsWithChildren } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarToggleButton, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/SidebarToggleButton",
};

/**
 * `SidebarToggleButton` flips the open/closed state of the surrounding
 * `<SidebarProvider>`. It must live inside one. Stories render it on its
 * own so the button can be inspected without competing layout chrome.
 */
const Wrapper = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <SidebarProvider>{children}</SidebarProvider>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <SidebarToggleButton />
  </Wrapper>
);

export const CustomClass = () => (
  <Wrapper>
    <SidebarToggleButton className="size-10" />
  </Wrapper>
);
