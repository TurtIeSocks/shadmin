import React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginForm } from "@/components/admin/login-form";

export default {
  title: "Layout/LoginForm",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const demoAuthProvider: AuthProvider = {
  login: ({ email, password }) =>
    email === "janedoe@acme.com" && password === "password"
      ? Promise.resolve()
      : Promise.reject(new Error("Invalid credentials")),
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
    <AuthLayout title="Sign in" subtitle="Try janedoe@acme.com / password">
      <LoginForm />
    </AuthLayout>
  </Wrapper>
);

export const WithRedirect = () => (
  <Wrapper>
    <AuthLayout title="Sign in" subtitle="Redirects to /dashboard on success">
      <LoginForm redirectTo="/dashboard" />
    </AuthLayout>
  </Wrapper>
);
