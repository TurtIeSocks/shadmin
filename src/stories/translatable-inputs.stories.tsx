import { ReactNode } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  required,
} from "ra-core";

import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { TranslatableInputs } from "@/components/admin/translatable-inputs";
import { i18nProvider } from "@/lib/i18nProvider";

const defaultRecord = {
  id: 1,
  name: {
    en: "Hello",
    fr: "Bonjour",
    tlh: "nuqneH",
  },
};

export default {
  title: "Inputs/TranslatableInputs",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record?: any;
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
    <SimpleForm toolbar={null}>
      <TranslatableInputs locales={["en", "fr", "tlh"]}>
        <TextInput source="name" />
      </TranslatableInputs>
    </SimpleForm>
  </StoryWrapper>
);

export const WithValidation = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <StoryWrapper theme={theme} record={{ id: 1, name: { en: "Hello" } }}>
    <SimpleForm toolbar={null} mode="onChange">
      <TranslatableInputs locales={["en", "fr", "tlh"]}>
        <TextInput source="name" validate={required()} />
      </TranslatableInputs>
    </SimpleForm>
  </StoryWrapper>
);
