import React from "react";
import { CoreAdminContext, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "UI & Layout/ThemeModeToggle",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({
  children,
  defaultTheme = "system",
}: React.PropsWithChildren<{ defaultTheme?: "system" | "light" | "dark" }>) => (
  <ThemeProvider defaultTheme={defaultTheme}>
    <CoreAdminContext
      i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
        allowMissing: true,
      })}
      store={memoryStore()}
    >
      {children}
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <ThemeModeToggle />
  </Wrapper>
);

export const Light = () => (
  <Wrapper defaultTheme="light">
    <ThemeModeToggle />
  </Wrapper>
);

export const Dark = () => (
  <Wrapper defaultTheme="dark">
    <ThemeModeToggle />
  </Wrapper>
);
