import React, { lazy } from "react";
import type { ReactNode } from "react";
import { AppBar, Layout, MenuItemLink } from "@/components/admin";
import type { ErrorProps } from "@/components/admin/feedback/error";
import { CoreAdminContext } from "shadmin-core";
import { Star } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export default {
  title: "UI & Layout/Layout",
};

export const Basic = () => (
  <CoreAdminContext>
    <Layout>Content</Layout>
  </CoreAdminContext>
);

const BrokenComponent = () => {
  throw new Error("I am broken");
};

export const ErrorState = () => (
  <CoreAdminContext>
    <Layout>
      <BrokenComponent />
    </Layout>
  </CoreAdminContext>
);

const LazyComponent = lazy(() => new Promise(() => {}));

export const LoadingState = () => (
  <CoreAdminContext>
    <Layout>
      <LazyComponent />
    </Layout>
  </CoreAdminContext>
);

const BrandedAppBar = () => (
  <AppBar>
    <span className="font-bold text-primary">Acme Admin</span>
  </AppBar>
);

export const CustomAppBar = () => (
  <CoreAdminContext>
    <Layout appBar={BrandedAppBar}>Content</Layout>
  </CoreAdminContext>
);

const NarrowSidebar = ({ children }: { children?: ReactNode }) => (
  <Sidebar
    variant="floating"
    collapsible="none"
    style={{ "--sidebar-width": "160px" } as React.CSSProperties}
  >
    <SidebarContent>{children}</SidebarContent>
  </Sidebar>
);

export const CustomSidebar = () => (
  <CoreAdminContext>
    <Layout sidebar={NarrowSidebar}>Content</Layout>
  </CoreAdminContext>
);

const StarMenu = () => (
  <MenuItemLink to="/featured" label="Featured" icon={<Star />} />
);

export const CustomMenu = () => (
  <CoreAdminContext>
    <Layout menu={StarMenu}>Content</Layout>
  </CoreAdminContext>
);

const MinimalError = ({ error, resetErrorBoundary }: ErrorProps) => (
  <div className="p-8 text-center space-y-2">
    <p className="text-destructive font-medium">
      {error instanceof Error ? error.message : "Unknown error"}
    </p>
    <button className="underline text-sm" onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
);

const Broken = () => {
  throw new Error("Intentional error");
};

export const CustomError = () => (
  <CoreAdminContext>
    <Layout error={MinimalError}>
      <Broken />
    </Layout>
  </CoreAdminContext>
);
