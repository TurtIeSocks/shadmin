import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseLoginPage } from "@/components/supabase/login-page";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default { title: "Supabase/LoginPage" };

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <SupabaseLoginPage />
  </Wrapper>
);

export const WithSocialProviders = () => (
  <Wrapper>
    <SupabaseLoginPage providers={["github", "google"]} />
  </Wrapper>
);

export const SocialOnly = () => (
  <Wrapper>
    <SupabaseLoginPage disableEmailPassword providers={["github", "google"]} />
  </Wrapper>
);

export const NoForgotPassword = () => (
  <Wrapper>
    <SupabaseLoginPage disableForgotPassword />
  </Wrapper>
);
