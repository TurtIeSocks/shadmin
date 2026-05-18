import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { SelectArrayInput, ThemeProvider } from "@/components/admin";
import { useWatch } from "react-hook-form";

export default {
  title: "Data Edition/SelectArrayInput",
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
    <SelectArrayInput source="tags" choices={tags} placeholder="Pick tags..." />
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

export const WithOnCreate = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      onCreate={async (filter) => {
        const name = filter ?? "New Tag";
        return { id: name.toLowerCase().replace(/\s+/g, "-"), name };
      }}
      createLabel="Add a new tag"
      createItemLabel='Add "%{item}" as a tag'
    />
    <FormValues />
  </Wrapper>
);

export const WithInputLabelProps = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      InputLabelProps={{ className: "text-primary font-semibold" }}
    />
    <FormValues />
  </Wrapper>
);

export const WithCreateValue = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      onCreate={() => Promise.resolve({ id: "new-tag", name: "New Tag" })}
      createValue="__new__"
      createLabel="Add a new tag"
    />
    <FormValues />
  </Wrapper>
);

export const WithCreateLabel = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      onCreate={() => Promise.resolve({ id: "new-tag", name: "New Tag" })}
      createLabel="Add a new tag"
    />
    <FormValues />
  </Wrapper>
);

export const WithCreateItemLabel = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      onCreate={() => Promise.resolve({ id: "new-tag", name: "New Tag" })}
      createItemLabel='Add "%{item}" as a new tag'
    />
    <FormValues />
  </Wrapper>
);

export const WithCreateHintValue = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      onCreate={() => Promise.resolve({ id: "new-tag", name: "New Tag" })}
      createHintValue="@@create-tag"
      createLabel="Add a tag"
    />
    <FormValues />
  </Wrapper>
);

export const WithCreate = () => (
  <Wrapper>
    <SelectArrayInput
      source="tags"
      choices={tags}
      create={
        <div className="px-3 py-2 text-sm text-muted-foreground italic">
          + Create new tag (dialog would open here)
        </div>
      }
    />
    <FormValues />
  </Wrapper>
);
