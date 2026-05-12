import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ResettableTextInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Inputs/ResettableTextInput",
};

const record = {
  id: 1,
  title: "Apple",
  description: "",
};

const FormValues = () => {
  const values = useWatch();
  return <pre className="mt-4">{JSON.stringify(values, null, 2)}</pre>;
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
    <ResettableTextInput source="title" />
    <FormValues />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <ResettableTextInput source="description" />
    <FormValues />
  </Wrapper>
);

export const ClearAlwaysVisible = () => (
  <Wrapper>
    <ResettableTextInput source="description" clearAlwaysVisible />
    <FormValues />
  </Wrapper>
);

export const NotResettable = () => (
  <Wrapper>
    <ResettableTextInput source="title" resettable={false} />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <ResettableTextInput source="title" disabled />
    <FormValues />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <ResettableTextInput source="title" label="Product name" />
    <FormValues />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <ResettableTextInput
      source="title"
      helperText="Click × to clear the field"
    />
    <FormValues />
  </Wrapper>
);
