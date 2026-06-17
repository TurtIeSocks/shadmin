import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { AccessDenied } from "@/components/admin/auth/access-denied";

export default {
  title: "UI & Layout/AccessDenied",
  parameters: {
    layout: "fullscreen",
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <div className="h-screen">{children}</div>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <AccessDenied />
  </Wrapper>
);

export const CustomText = () => (
  <Wrapper>
    <AccessDenied
      textPrimary="Not allowed"
      textSecondary="You do not have access to this resource."
    />
  </Wrapper>
);
