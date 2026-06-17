import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AuthLayout } from "@/components/admin/auth-layout";

export default {
  title: "UI & Layout/AuthLayout",
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

const SampleAside = () => (
  <>
    <div className="absolute inset-0 bg-zinc-900" />
    <div className="relative z-20 flex items-center text-lg font-medium">
      Acme Inc
    </div>
    <div className="relative z-20 mt-auto">
      <blockquote className="space-y-2">
        <p className="text-lg">
          &ldquo;Shadmin has allowed us to quickly create and evolve a powerful
          tool that otherwise would have taken months of time and effort to
          develop.&rdquo;
        </p>
        <footer className="text-sm">Jane Doe</footer>
      </blockquote>
    </div>
  </>
);

export const Basic = () => (
  <Wrapper>
    <AuthLayout title="Sign in" subtitle="Welcome back">
      <p className="text-sm text-muted-foreground text-center">
        Your custom form would go here.
      </p>
    </AuthLayout>
  </Wrapper>
);

export const WithAside = () => (
  <Wrapper>
    <AuthLayout title="Sign in" subtitle="Welcome back" aside={<SampleAside />}>
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
