import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { SelectArrayInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Inputs/SelectArrayInput",
};

const record = {
  id: 1,
  name: "My Post",
  tags: ["tech"],
};

const tags = [
  { id: "tech", name: "Tech" },
  { id: "news", name: "News" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "entertainment", name: "Entertainment" },
  { id: "sports", name: "Sports" },
  { id: "health", name: "Health" },
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
    <SelectArrayInput source="tags" choices={tags} />
    <FormValues />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      placeholder="Pick tags..."
    />
    <FormValues />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <SelectArrayInput source="tags" choices={tags} disabled />
    <FormValues />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <SelectArrayInput source="tags" choices={tags} label="Pick tags" />
    <FormValues />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      helperText="Choose one or more topics"
    />
    <FormValues />
  </Wrapper>
);

export const CustomOptionText = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={[
        { _id: "tech", label: "Tech" },
        { _id: "news", label: "News" },
        { _id: "lifestyle", label: "Lifestyle" },
      ]}
      optionText="label"
      optionValue="_id"
    />
    <FormValues />
  </Wrapper>
);

export const DisabledChoice = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={[
        { id: "tech", name: "Tech" },
        { id: "news", name: "News", disabled: true },
        { id: "lifestyle", name: "Lifestyle" },
      ]}
    />
    <FormValues />
  </Wrapper>
);
