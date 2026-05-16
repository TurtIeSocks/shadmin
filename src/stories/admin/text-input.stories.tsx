import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { TextInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Data Edition/TextInput",
};

const record = {
  id: 1,
  title: "Data Edition/TextInput",
};

const FormValues = () => {
  const values = useWatch();
  return <pre>{JSON.stringify(values, null, 2)}</pre>;
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={record}>
        <Form>{children}</Form>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <TextInput source="title" />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <TextInput source="title" disabled />
    <FormValues />
  </Wrapper>
);
