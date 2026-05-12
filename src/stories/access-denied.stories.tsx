import React from "react";
import { CoreAdminContext } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AccessDenied } from "@/components/admin/access-denied";

export default {
  title: "Layout/AccessDenied",
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
