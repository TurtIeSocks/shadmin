import { CoreAdminContext, RecordContextProvider } from "ra-core";
import {
  AutocompleteArrayInput,
  SimpleForm,
  ThemeProvider,
} from "@/components/admin";
import { i18nProvider } from "@/lib/i18n-provider";
import { ReactNode } from "react";

const record = {
  id: 1,
  tags: ["tech"],
  title: "War and Peace",
};

export default {
  title: "Data Edition/AutocompleteArrayInput",
  parameters: {
    docs: {
      // 👇 Enable Code panel for all stories in this file
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
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={record}>{children}</RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const choices = [
  { id: "tech", name: "Tech" },
  { id: "news", name: "News" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "entertainment", name: "Entertainment" },
  { id: "sports", name: "Sports" },
  { id: "health", name: "Health" },
  { id: "education", name: "Education" },
  { id: "finance", name: "Finance" },
  { id: "travel", name: "Travel" },
];

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <SimpleForm>
      <AutocompleteArrayInput source="tags" choices={choices} />
    </SimpleForm>
  </StoryWrapper>
);

const getCurrencyChoices = () => {
  const displayNames = new Intl.DisplayNames(
    typeof navigator !== "undefined"
      ? (navigator.languages as string[])
      : ["en"],
    { type: "currency" },
  );
  // @ts-expect-error supportedValuesOf is not yet in ts type, but it is supported in all modern browsers
  return Intl.supportedValuesOf("currency").map((code: string) => ({
    id: code,
    name: `${code} - ${displayNames.of(code)}`,
  }));
};

const currencyChoices = getCurrencyChoices();

export const WithMismatchedOptionTextAndValue = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="contact_id"
        optionValue="id"
        choices={currencyChoices}
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithOnCreate = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithNoOptionsText = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        noOptionsText="Nothing matches your search"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithMatchSuggestion = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        matchSuggestion={(filter, choice) =>
          (choice as { name: string }).name
            .toLowerCase()
            .startsWith(filter.toLowerCase())
        }
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithLimitChoicesToValue = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput source="tags" choices={choices} limitChoicesToValue />
    </SimpleForm>
  </StoryWrapper>
);

export const WithIsOptionEqualToValue = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        isOptionEqualToValue={(option, value) => option === value}
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithHandleHomeEndKeys = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput source="tags" choices={choices} handleHomeEndKeys />
    </SimpleForm>
  </StoryWrapper>
);

export const WithEmptyText = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput source="tags" choices={choices} emptyText="No tags" />
    </SimpleForm>
  </StoryWrapper>
);

export const WithCreateValue = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
        createValue="__ra_create__"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithCreateLabel = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
        createLabel="Start typing to add a tag"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithCreateItemLabel = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
        createItemLabel="Add '%{item}' as a new tag"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithCreateHintValue = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
        createHintValue="__new__"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithCreate = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput
        source="tags"
        choices={choices}
        onCreate={(filter) => {
          const newTag = { id: String(filter).toLowerCase(), name: String(filter) };
          return newTag;
        }}
        createLabel="Start typing to add a tag"
      />
    </SimpleForm>
  </StoryWrapper>
);

export const WithClearOnBlur = () => (
  <StoryWrapper theme="system">
    <SimpleForm>
      <AutocompleteArrayInput source="tags" choices={choices} clearOnBlur />
    </SimpleForm>
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
};
