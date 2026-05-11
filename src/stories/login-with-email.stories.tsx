import React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginWithEmail } from "@/components/admin/login-with-email";

export default {
  title: "Layout/LoginWithEmail",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const demoAuthProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext
      authProvider={demoAuthProvider}
      i18nProvider={i18nProvider}
    >
      {children}
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <AuthLayout
      title="Sign in"
      subtitle="Enter your email to receive a magic link"
    >
      <LoginWithEmail submitLabel="Send magic link" />
    </AuthLayout>
  </Wrapper>
);

export const CustomSubmit = () => (
  <Wrapper>
    <AuthLayout
      title="Passwordless sign in"
      subtitle="We'll email you a link you can use to sign in"
    >
      <LoginWithEmail
        submitLabel="Send magic link"
        onSubmit={async ({ email }) => {
          // demo only — replace with your passwordless flow
          window.alert(`Magic link sent to ${email}`);
        }}
      />
    </AuthLayout>
  </Wrapper>
);
