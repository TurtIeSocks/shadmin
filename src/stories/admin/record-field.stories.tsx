import React from "react";
import { CoreAdminContext, RecordContextProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { RecordField } from "@/components/admin/record-field";
import { NumberField } from "@/components/admin/number-field";
import { TextField } from "@/components/admin/text-field";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Display/RecordField",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const record = {
  id: 1,
  title: "Hello world",
  reference: "REF-001",
  price: 49.99,
  width: 100,
  height: 200,
  status: "published",
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
        <div className="p-4 max-w-md space-y-4">{children}</div>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <RecordField source="title" />
    <RecordField source="reference" />
    <RecordField source="status" />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <RecordField source="reference" label="Ref." />
    <RecordField source="title" label="Title" />
  </Wrapper>
);

export const Inline = () => (
  <Wrapper>
    <RecordField source="title" variant="inline" />
    <RecordField source="reference" variant="inline" />
    <RecordField source="status" variant="inline" />
  </Wrapper>
);

export const WithRender = () => (
  <Wrapper>
    <RecordField
      label="Dimensions"
      render={(r) => `${r.width as number}x${r.height as number}`}
    />
    <RecordField
      label="Price"
      render={(r) => `$${(r.price as number).toFixed(2)}`}
    />
  </Wrapper>
);

export const WithFieldComponent = () => (
  <Wrapper>
    <RecordField source="price" field={NumberField} />
    <RecordField source="title" field={TextField} />
  </Wrapper>
);
