import { ReactNode } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  useTranslatableContext,
} from "shadmin-core";

import { TextField } from "@/components/admin/text-field";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { TranslatableFields } from "@/components/admin/translatable-fields";
import { i18nProvider } from "@/lib/i18n-provider";
import type { UnknownRecord } from "@/lib/unknown-types";

const defaultRecord = {
  id: 1,
  name: {
    en: "Hello",
    fr: "Bonjour",
    tlh: "nuqneH",
  },
  description: {
    en: "A friendly greeting",
    fr: "Une salutation amicale",
    tlh: "qoH neH",
  },
};

export default {
  title: "Data Display/TranslatableFields",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const StoryWrapper = ({
  children,
  theme,
  record = defaultRecord,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
  record?: UnknownRecord;
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <ResourceContextProvider value="posts">
        <RecordContextProvider value={record}>{children}</RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <TranslatableFields locales={["en", "fr", "tlh"]}>
      <TextField source="name" />
      <TextField source="description" />
    </TranslatableFields>
  </StoryWrapper>
);

const CustomLocaleSelector = () => {
  const { locales, selectedLocale, selectLocale } = useTranslatableContext();
  return (
    <select
      value={selectedLocale}
      onChange={(event) => selectLocale(event.target.value)}
      className="mb-2 rounded border px-2 py-1 text-sm"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </select>
  );
};

export const WithCustomSelector = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <StoryWrapper theme={theme}>
    <TranslatableFields
      locales={["en", "fr", "tlh"]}
      selector={<CustomLocaleSelector />}
    >
      <TextField source="name" />
    </TranslatableFields>
  </StoryWrapper>
);
