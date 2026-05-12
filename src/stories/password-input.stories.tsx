import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { PasswordInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Inputs/PasswordInput",
};

const record = {
  id: 1,
  email: "alice@example.com",
  password: "hunter2",
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
    <PasswordInput source="password" />
    <FormValues />
  </Wrapper>
);

export const InitiallyVisible = () => (
  <Wrapper>
    <PasswordInput source="password" initiallyVisible />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <PasswordInput source="password" disabled />
    <FormValues />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <PasswordInput source="password" label="Choose a password" />
    <FormValues />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <PasswordInput
      source="password"
      helperText="Must be at least 8 characters"
    />
    <FormValues />
  </Wrapper>
);
