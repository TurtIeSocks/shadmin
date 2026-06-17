import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { SimpleForm } from "@/components/admin/simple-form";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { ArrayInput } from "@/components/admin/array-input";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Edition/SimpleFormIterator",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const defaultRecord = {
  id: 1,
  tags: [{ name: "react" }, { name: "typescript" }],
  items: [
    { name: "Office Jeans", price: 45.99, quantity: 1 },
    { name: "Black Elegance Jeans", price: 69.99, quantity: 2 },
  ],
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
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="name" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Wrapper>
);

export const Inline = () => (
  <Wrapper>
    <SimpleForm>
      <ArrayInput source="items">
        <SimpleFormIterator inline>
          <TextInput source="name" />
          <NumberInput source="price" />
          <NumberInput source="quantity" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Wrapper>
);

export const DisableAdd = () => (
  <Wrapper>
    <SimpleForm>
      <ArrayInput source="tags">
        <SimpleFormIterator disableAdd>
          <TextInput source="name" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Wrapper>
);

export const DisableRemove = () => (
  <Wrapper>
    <SimpleForm>
      <ArrayInput source="tags">
        <SimpleFormIterator disableRemove>
          <TextInput source="name" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Wrapper>
);
