import React from "react";
import { CoreAdminContext, type AuthProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { AuthLayout } from "@/components/admin/auth/auth-layout";
import { LoginWithEmail } from "@/components/admin/auth/login-with-email";

export default {
  title: "UI & Layout/LoginWithEmail",
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
    <AuthLayout title="Sign in" subtitle="Enter your email and password">
      <LoginWithEmail />
    </AuthLayout>
  </Wrapper>
);

export const CustomSubmit = () => (
  <Wrapper>
    <AuthLayout title="Custom sign in" subtitle="Sign in with a custom flow">
      <LoginWithEmail
        onSubmit={async ({ email, password }) => {
          // demo only — replace with your own sign-in flow
          window.alert(`Sign in: ${email} / ${password}`);
        }}
      />
    </AuthLayout>
  </Wrapper>
);
