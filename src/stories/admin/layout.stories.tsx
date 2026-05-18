import { lazy } from "react";
import { AppBar, Layout } from "@/components/admin";
import { CoreAdminContext } from "ra-core";

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
