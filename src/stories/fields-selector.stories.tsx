import React from "react";
import {
  CoreAdminContext,
  PreferenceKeyContextProvider,
  PreferencesEditorContextProvider,
  memoryStore,
} from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider.ts";
import { FieldsSelector, ThemeProvider } from "@/components/admin";

export default {
  title: "Inspector/FieldsSelector",
};

const seededColumns = [
  { index: "0", source: "title", label: "Title" },
  { index: "1", source: "author", label: "Author" },
  { index: "2", source: "year", label: "Year" },
  { index: "3", source: "isbn", label: "ISBN" },
];

const buildStore = () => {
  const store = memoryStore({
    "preferences.books.list.availableColumns": seededColumns,
    "preferences.books.list.columns": ["0", "1", "2"],
  });
  return store;
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider} store={buildStore()}>
      <PreferencesEditorContextProvider>
        <div className="max-w-xs rounded-md border bg-popover p-3 m-6 shadow-sm">
          <PreferenceKeyContextProvider value="preferences.books.list">
            {children}
          </PreferenceKeyContextProvider>
        </div>
      </PreferencesEditorContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <FieldsSelector />
  </Wrapper>
);

const seededInputs = [
  { index: "0", source: "first_name", label: "First name" },
  { index: "1", source: "last_name", label: "Last name" },
  { index: "2", source: "email", label: "Email" },
  { index: "3", source: "phone", label: "Phone" },
];

const buildCustomStore = () =>
  memoryStore({
    "preferences.users.form.availableInputs": seededInputs,
    "preferences.users.form.inputs": ["0", "1", "2"],
  });

const CustomKeysWrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider} store={buildCustomStore()}>
      <PreferencesEditorContextProvider>
        <div className="max-w-xs rounded-md border bg-popover p-3 m-6 shadow-sm">
          <PreferenceKeyContextProvider value="preferences.users.form">
            {children}
          </PreferenceKeyContextProvider>
        </div>
      </PreferencesEditorContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const CustomPreferenceKeys = () => (
  <CustomKeysWrapper>
    <FieldsSelector name="inputs" availableName="availableInputs" />
  </CustomKeysWrapper>
);
