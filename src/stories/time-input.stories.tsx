import * as React from "react";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { CoreAdminContext, required } from "ra-core";
import { useWatch } from "react-hook-form";

import {
  Create,
  SimpleForm,
  SimpleFormProps,
  TimeInput,
  TimeInputProps,
} from "@/components/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default { title: "Inputs/TimeInput" };

const FormValues = () => {
  const values = useWatch();
  return <pre className="mt-4">{JSON.stringify(values, null, 2)}</pre>;
};

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const Wrapper = ({
  children,
  simpleFormProps,
}: {
  children: React.ReactNode;
  simpleFormProps?: Partial<SimpleFormProps>;
}) => (
  <CoreAdminContext i18nProvider={i18nProvider}>
    <Create resource="events">
      <SimpleForm {...simpleFormProps}>
        {children}
        <FormValues />
      </SimpleForm>
    </Create>
  </CoreAdminContext>
);

export const Basic = ({ timeInputProps }: StoryProps) => (
  <Wrapper>
    <TimeInput source="opensAt" {...timeInputProps} />
  </Wrapper>
);

export const DefaultValue = () => (
  <Wrapper>
    <TimeInput source="opensAt" defaultValue="09:30" />
    <TimeInput source="closesAt" defaultValue="18:00" />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <TimeInput source="opensAt" defaultValue="09:30" disabled />
  </Wrapper>
);

export const ReadOnly = () => (
  <Wrapper>
    <TimeInput source="opensAt" defaultValue="09:30" readOnly />
  </Wrapper>
);

export const Required = () => (
  <Wrapper simpleFormProps={{ mode: "onChange" }}>
    <Alert>
      <AlertDescription>Opening time is required.</AlertDescription>
    </Alert>
    <TimeInput source="opensAt" validate={required()} />
  </Wrapper>
);

export const Label = () => (
  <Wrapper>
    <TimeInput source="opensAt" label="Opening time" />
  </Wrapper>
);

export const HelperText = () => (
  <Wrapper>
    <TimeInput source="opensAt" helperText="Use 24-hour format" />
  </Wrapper>
);

type StoryProps = {
  timeInputProps?: Partial<TimeInputProps>;
  simpleFormProps?: Partial<SimpleFormProps>;
};
