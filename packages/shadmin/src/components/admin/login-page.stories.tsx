import React from "react";
import { CoreAdminContext, AuthProvider, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";

import { LoginPage } from "@/components/admin/login-page";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "UI & Layout/LoginPage",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const authProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  checkAuth: () => Promise.reject(),
  getPermissions: () => Promise.resolve(undefined),
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        authProvider={authProvider}
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          {
            allowMissing: true,
          },
        )}
        store={memoryStore()}
      >
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <LoginPage />
  </Wrapper>
);

export const WithRedirect = () => (
  <Wrapper>
    <LoginPage redirectTo="/dashboard" />
  </Wrapper>
);
