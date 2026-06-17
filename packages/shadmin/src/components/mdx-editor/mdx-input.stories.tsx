import { ReactNode } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  required,
} from "shadmin-core";
import { useFormContext, useWatch } from "react-hook-form";

import { SimpleForm, ThemeProvider } from "@/components/admin";
import { MdxInput } from "@/components/mdx-editor";
import { Button } from "@/components/ui/button";
import { i18nProvider } from "@/lib/i18n-provider";
import "@mdxeditor/editor/style.css";

const record = {
  id: 1,
  body: "# Hello\n\nThis is an **initial markdown** value.",
};

export default {
  title: "MDX Editor/MdxInput",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const StoryWrapper = ({
  children,
  theme,
  defaultValues,
  toolbar,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
  defaultValues?: Record<string, unknown>;
  toolbar?: ReactNode;
}) => (
  <ThemeProvider defaultTheme={theme} storageKey={`mdx-input-story-${theme}`}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={defaultValues ?? record}>
        <SimpleForm toolbar={toolbar}>{children}</SimpleForm>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const StoryArgs = {
  args: { theme: "system" as const },
  argTypes: {
    theme: {
      type: "select" as const,
      options: ["light", "dark", "system"],
    },
  },
};

const FormValues = () => {
  const values = useWatch();
  return (
    <pre className="whitespace-pre-wrap wrap-break-word">
      {JSON.stringify(values, null, 2)}
    </pre>
  );
};

const BodyHelper = () => {
  const { setValue, resetField } = useFormContext();
  const currentValue = useWatch({ name: "body" });

  return (
    <div className="space-y-2">
      <p className="text-sm">Current value: {currentValue || "-"}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            setValue("body", "Value changed externally.", {
              shouldDirty: true,
            });
          }}
        >
          Change value
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            resetField("body");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <MdxInput source="body" />
    <FormValues />
  </StoryWrapper>
);
Object.assign(Basic, StoryArgs);

export const Disabled = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <MdxInput source="body" disabled />
    <FormValues />
  </StoryWrapper>
);
Object.assign(Disabled, StoryArgs);

export const ReadOnly = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <MdxInput source="body" readOnly />
    <FormValues />
  </StoryWrapper>
);
Object.assign(ReadOnly, StoryArgs);

export const Validation = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <StoryWrapper theme={theme} defaultValues={{ id: 1, body: "" }}>
    <MdxInput source="body" validate={required()} />
    <FormValues />
  </StoryWrapper>
);
Object.assign(Validation, StoryArgs);

export const CustomLabel = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <StoryWrapper theme={theme}>
    <MdxInput
      source="body"
      label="Article body"
      helperText="Markdown is supported."
    />
    <FormValues />
  </StoryWrapper>
);
Object.assign(CustomLabel, StoryArgs);

export const ExternalChanges = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <StoryWrapper theme={theme}>
    <MdxInput source="body" />
    <BodyHelper />
    <FormValues />
  </StoryWrapper>
);
Object.assign(ExternalChanges, StoryArgs);

export const Dark = () => (
  <div className="dark bg-background p-4">
    <Basic theme="dark" />
  </div>
);
