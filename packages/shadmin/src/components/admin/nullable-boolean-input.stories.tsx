import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import type { RaRecord } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { NullableBooleanInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Data Edition/NullableBooleanInput",
};

const defaultRecord = {
  id: 1,
  isPublished: null,
};

const FormValues = () => {
  const values = useWatch();
  return <pre className="mt-4">{JSON.stringify(values, null, 2)}</pre>;
};

const Wrapper = ({
  children,
  record = defaultRecord,
}: React.PropsWithChildren & { record?: RaRecord }) => (
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
    <NullableBooleanInput source="isPublished" />
    <FormValues />
  </Wrapper>
);

export const TrueValue = () => (
  <Wrapper record={{ id: 1, isPublished: true }}>
    <NullableBooleanInput source="isPublished" />
    <FormValues />
  </Wrapper>
);

export const FalseValue = () => (
  <Wrapper record={{ id: 1, isPublished: false }}>
    <NullableBooleanInput source="isPublished" />
    <FormValues />
  </Wrapper>
);

export const CustomLabels = () => (
  <Wrapper>
    <NullableBooleanInput
      source="isPublished"
      nullLabel="Not specified"
      trueLabel="Published"
      falseLabel="Draft"
    />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <NullableBooleanInput source="isPublished" disabled />
    <FormValues />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <NullableBooleanInput source="isPublished" label="Published?" />
    <FormValues />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <NullableBooleanInput
      source="isPublished"
      helperText="Leave empty when status is unknown"
    />
    <FormValues />
  </Wrapper>
);
