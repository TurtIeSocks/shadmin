import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  memoryStore,
  required,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { SimpleForm, FormToolbar } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { SaveButton } from "@/components/admin/save-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Edition/SimpleForm",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const defaultRecord = {
  id: 1,
  title: "Hello world",
  body: "Lorem ipsum",
  published: true,
};

const Wrapper = ({
  children,
  record = defaultRecord,
}: React.PropsWithChildren<{ record?: Record<string, unknown> }>) => (
  <ThemeProvider>
    <CoreAdminContext
      i18nProvider={polyglotI18nProvider(
        () => defaultMessages,
        "en",
        undefined,
        {
          allowMissing: true,
        },
      )}
      store={memoryStore()}
    >
      <ResourceContextProvider value="posts">
        <RecordContextProvider value={record}>
          <div className="p-4 max-w-lg">{children}</div>
        </RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
      <BooleanInput source="published" />
    </SimpleForm>
  </Wrapper>
);

export const WithValidation = () => (
  <Wrapper>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="body" multiline validate={required()} />
    </SimpleForm>
  </Wrapper>
);

export const NoToolbar = () => (
  <Wrapper>
    <SimpleForm toolbar={false}>
      <TextInput source="title" />
      <TextInput source="body" />
    </SimpleForm>
  </Wrapper>
);

export const CustomToolbar = () => (
  <Wrapper>
    <SimpleForm
      toolbar={
        <FormToolbar>
          <SaveButton label="Publish" />
        </FormToolbar>
      }
    >
      <TextInput source="title" />
      <TextInput source="body" />
    </SimpleForm>
  </Wrapper>
);
