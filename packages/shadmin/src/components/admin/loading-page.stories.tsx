import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { I18nContextProvider } from "shadmin-core";
import { LoadingPage } from "@/components/admin/loading";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/LoadingPage",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const StoryWrapper = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
}) => <ThemeProvider defaultTheme={theme}>{children}</ThemeProvider>;

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

export const Basic = ({
  theme,
  delay,
}: {
  theme: "system" | "light" | "dark";
  delay?: number;
}) => (
  <StoryWrapper theme={theme}>
    <I18nContextProvider value={i18nProvider}>
      <LoadingPage delay={delay} />
    </I18nContextProvider>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
  delay: {
    type: "number",
    defaultValue: 1000,
  },
};
