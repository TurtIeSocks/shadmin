import React from "react";
import { CoreAdminContext } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AuthLayout } from "@/components/admin/auth-layout";

export default {
  title: "Layout/AuthLayout",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>{children}</CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back to Acme Inc."
    >
      <p className="text-sm text-muted-foreground text-center">
        Your custom form would go here.
      </p>
    </AuthLayout>
  </Wrapper>
);

export const WithoutHeading = () => (
  <Wrapper>
    <AuthLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Custom heading inside content</h2>
        <p className="text-sm text-muted-foreground">
          Skip the built-in `title` / `subtitle` props when you want to render
          your own heading.
        </p>
      </div>
    </AuthLayout>
  </Wrapper>
);
