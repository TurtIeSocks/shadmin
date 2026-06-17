import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { NumberInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Data Edition/NumberInput",
};

const record = {
  id: 1,
  title: "War and Peace",
  price: 1.99,
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
    <NumberInput source="price" />
    <FormValues />
  </Wrapper>
);

export const Step = () => (
  <Wrapper>
    <NumberInput source="price" step="0.01" />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <NumberInput source="price" disabled />
    <FormValues />
  </Wrapper>
);
