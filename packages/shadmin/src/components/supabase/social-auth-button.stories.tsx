import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import {
  GithubButton,
  GoogleButton,
  SocialAuthButton,
} from "@/components/supabase/social-auth-button";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default {
  title: "Supabase/SocialAuthButton",
};

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const noopAuthProvider: AuthProvider = {
  login: async () => {
    /* no-op */
  },
  logout: async () => {
    /* no-op */
  },
  checkAuth: async () => {
    /* no-op */
  },
  checkError: async () => {
    /* no-op */
  },
  getPermissions: async () => null,
};

const Wrapper = ({
  children,
  authProvider = noopAuthProvider,
}: React.PropsWithChildren<{ authProvider?: AuthProvider }>) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={authProvider} i18nProvider={i18nProvider}>
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Github = () => (
  <Wrapper>
    <GithubButton />
  </Wrapper>
);

export const Google = () => (
  <Wrapper>
    <GoogleButton />
  </Wrapper>
);

export const CustomProvider = () => (
  <Wrapper>
    <SocialAuthButton provider="apple">Custom Apple label</SocialAuthButton>
  </Wrapper>
);

export const Basic = Github;
