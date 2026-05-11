import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider.ts";
import { CheckboxGroupInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Inputs/CheckboxGroupInput",
};

const record = {
  id: 1,
  name: "Hello, World",
  tags: ["lifestyle"],
};

const tags = [
  { id: "tech", name: "Tech" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "people", name: "People" },
];

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
    <CheckboxGroupInput source="tags" choices={tags} />
    <FormValues />
  </Wrapper>
);

export const Row = () => (
  <Wrapper>
    <CheckboxGroupInput source="tags" choices={tags} row />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <CheckboxGroupInput source="tags" choices={tags} disabled />
    <FormValues />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <CheckboxGroupInput
      source="tags"
      choices={tags}
      label="Pick your interests"
    />
    <FormValues />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <CheckboxGroupInput
      source="tags"
      choices={tags}
      helperText="Choose one or more topics"
    />
    <FormValues />
  </Wrapper>
);

export const DisabledChoice = () => (
  <Wrapper>
    <CheckboxGroupInput
      source="tags"
      choices={[
        { id: "tech", name: "Tech" },
        { id: "lifestyle", name: "Lifestyle", disabled: true },
        { id: "people", name: "People" },
      ]}
    />
    <FormValues />
  </Wrapper>
);
