import { lazy } from "react";
import { AppBar, Layout, MenuItemLink } from "@/components/admin";
import type { ErrorProps } from "@/components/admin/error";
import { CoreAdminContext } from "ra-core";
import { Star } from "lucide-react";

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

const StarMenu = () => (
  <MenuItemLink to="/featured" primaryText="Featured" leftIcon={<Star />} />
);

export const CustomMenu = () => (
  <CoreAdminContext>
    <Layout menu={StarMenu}>Content</Layout>
  </CoreAdminContext>
);

const MinimalError = ({ error, resetErrorBoundary }: ErrorProps) => (
  <div className="p-8 text-center space-y-2">
    <p className="text-destructive font-medium">{error?.message ?? "Unknown error"}</p>
    <button className="underline text-sm" onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const Broken = () => { throw new Error("Intentional error"); };

export const CustomError = () => (
  <CoreAdminContext>
    <Layout error={MinimalError}>
      <Broken />
    </Layout>
  </CoreAdminContext>
);
