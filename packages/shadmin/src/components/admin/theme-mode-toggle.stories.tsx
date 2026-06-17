import React from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";
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
  // `CoreAdminContext` must wrap `ThemeProvider` because the latter's
  // `useStore` call only receives notifications once the store inside
  // `CoreAdminContext` has been `setup()`d.
  <CoreAdminContext
    i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
      allowMissing: true,
    })}
    store={memoryStore()}
  >
    <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
  </CoreAdminContext>
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
