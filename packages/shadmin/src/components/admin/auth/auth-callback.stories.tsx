import React from "react";
import { CoreAdminContext, type AuthProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { AuthCallback } from "@/components/admin/auth/auth-callback";

export default {
  title: "UI & Layout/AuthCallback",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const okAuthProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  handleCallback: () => new Promise(() => {}), // never resolves -> stuck in loading
};

const failingAuthProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  handleCallback: () => Promise.reject(new Error("OAuth state mismatch")),
};

const Wrapper = ({
  children,
  authProvider,
}: React.PropsWithChildren<{ authProvider: AuthProvider }>) => (
  <ThemeProvider>
    <CoreAdminContext authProvider={authProvider} i18nProvider={i18nProvider}>
      {children}
    </CoreAdminContext>
  </ThemeProvider>
);

export const Loading = () => (
  <Wrapper authProvider={okAuthProvider}>
    <AuthCallback />
  </Wrapper>
);

export const ErrorState = () => (
  <Wrapper authProvider={failingAuthProvider}>
    <AuthCallback />
  </Wrapper>
);

export const Basic = Loading;
