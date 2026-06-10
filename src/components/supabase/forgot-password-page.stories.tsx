import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { ForgotPasswordPage } from "@/components/supabase/forgot-password-page";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default { title: "Supabase/ForgotPasswordPage" };

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

export const Default = () => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        <ForgotPasswordPage />
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = Default;
