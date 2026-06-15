import React from "react";
import { CoreAdminContext, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { Globe } from "lucide-react";

import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "UI & Layout/LocalesMenuButton",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const frenchMessages = englishMessages;

const i18nProviderWithLocales = polyglotI18nProvider(
  () => englishMessages,
  "en",
  [
    { locale: "en", name: "English" },
    { locale: "fr", name: "Français" },
  ],
  { allowMissing: true },
);

const i18nProviderSingleLocale = polyglotI18nProvider(
  () => englishMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const Wrapper = ({
  children,
  i18nProvider = i18nProviderWithLocales,
}: React.PropsWithChildren<{
  i18nProvider?: ReturnType<typeof polyglotI18nProvider>;
}>) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider} store={memoryStore()}>
      <div className="p-4">{children}</div>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <LocalesMenuButton />
  </Wrapper>
);

export const SingleLocale = () => (
  <Wrapper i18nProvider={i18nProviderSingleLocale}>
    {/* Returns null when only one locale is available */}
    <LocalesMenuButton />
    <p className="text-sm text-muted-foreground mt-2">
      (renders nothing when only one locale is configured)
    </p>
  </Wrapper>
);

export const CustomIcon = () => (
  <Wrapper>
    <LocalesMenuButton icon={<Globe className="size-4" />} />
  </Wrapper>
);

export const WithRef = () => {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <Wrapper>
      <LocalesMenuButton ref={ref} />
    </Wrapper>
  );
};

// Suppress unused
void frenchMessages;
