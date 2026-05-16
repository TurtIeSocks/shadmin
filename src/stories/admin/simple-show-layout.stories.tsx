import React from "react";
import { CoreAdminContext, RecordContextProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { SimpleShowLayout } from "@/components/admin/simple-show-layout";
import { TextField } from "@/components/admin/text-field";
import { NumberField } from "@/components/admin/number-field";
import { BooleanField } from "@/components/admin/boolean-field";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Page components/SimpleShowLayout",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const record = {
  id: 1,
  title: "Hello world",
  author: "Jane Doe",
  views: 123,
  published: true,
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext
      i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
        allowMissing: true,
      })}
      store={memoryStore()}
    >
      <RecordContextProvider value={record}>
        <div className="p-4 max-w-md">{children}</div>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="author" />
      <NumberField source="views" />
      <BooleanField source="published" />
    </SimpleShowLayout>
  </Wrapper>
);

export const CustomClassName = () => (
  <Wrapper>
    <SimpleShowLayout className="gap-8 bg-muted p-4 rounded">
      <TextField source="title" />
      <TextField source="author" />
    </SimpleShowLayout>
  </Wrapper>
);

export const NestedFields = () => (
  <Wrapper>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="author" />
      <NumberField source="views" />
    </SimpleShowLayout>
  </Wrapper>
);
