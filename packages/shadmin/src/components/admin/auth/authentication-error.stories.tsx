import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { AuthenticationError } from "@/components/admin/auth/authentication-error";

export default {
  title: "UI & Layout/AuthenticationError",
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
    <AuthenticationError />
  </Wrapper>
);

export const CustomText = () => (
  <Wrapper>
    <AuthenticationError
      textPrimary="Session expired"
      textSecondary="Please sign in again to continue."
    />
  </Wrapper>
);
