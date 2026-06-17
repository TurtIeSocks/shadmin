import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { AuthError } from "@/components/admin/auth-error";

export default {
  title: "UI & Layout/AuthError",
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

export const Basic = ({ message }: { message?: string }) => (
  <Wrapper>
    <AuthError message={message} />
  </Wrapper>
);

Basic.args = {
  message: undefined,
};

Basic.argTypes = {
  message: {
    type: "string",
  },
};
