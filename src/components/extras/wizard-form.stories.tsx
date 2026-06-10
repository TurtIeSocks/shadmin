import { type ReactNode, useState } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  required,
  ResourceContextProvider,
} from "ra-core";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { WizardForm, WizardToolbar } from "@/components/extras/wizard-form";
import { TextInput } from "@/components/admin/text-input";
import { i18nProvider } from "@/lib/i18n-provider";
import type { UnknownRecord } from "@/lib/unknown-types";

const defaultRecord: UnknownRecord = { id: 1 };

const StoryWrapper = ({
  children,
  theme,
  record = defaultRecord,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
  record?: UnknownRecord;
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <ResourceContextProvider value="products">
        <RecordContextProvider value={record}>{children}</RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const storyArgs = {
  args: { theme: "system" as const },
  argTypes: {
    theme: {
      type: "select" as const,
      options: ["light", "dark", "system"],
    },
  },
};

export default {
  title: "Extras/WizardForm",
  parameters: { docs: { codePanel: true } },
};

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        description="One step demo."
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(Basic, storyArgs);

export const MultipleSteps = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
        <WizardForm.Step label="Review">
          <TextInput source="notes" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(MultipleSteps, storyArgs);

export const WithValidation = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(WithValidation, storyArgs);

export const OptionalStep = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a product"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity" optional>
          <TextInput source="name" validate={required()} />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(OptionalStep, storyArgs);

export const SubmitClosesDialog = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      {submitted ? (
        <div data-testid="submitted">{JSON.stringify(submitted)}</div>
      ) : null}
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        onSubmit={(values: Record<string, unknown>) => {
          setSubmitted(values);
          setOpen(false);
        }}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Done">
          <TextInput source="notes" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(SubmitClosesDialog, storyArgs);

export const ServerErrorOnFirstStep = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme} record={{ id: 1 }}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        // ra-core's <Form> treats a { field: message } return as a submission error
        onSubmit={() => ({ name: "Reserved name" })}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ServerErrorOnFirstStep, storyArgs);

export const ProgressDots = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        progress="dots"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ProgressDots, storyArgs);

export const ProgressNone = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        progress="none"
        onSubmit={() => {}}
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(ProgressNone, storyArgs);

export const CustomToolbar = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper theme={theme}>
      <WizardForm
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create"
        onSubmit={() => {}}
        toolbar={
          <div data-testid="custom-toolbar">
            <WizardToolbar />
          </div>
        }
      >
        <WizardForm.Step label="Identity">
          <TextInput source="name" />
        </WizardForm.Step>
        <WizardForm.Step label="Pricing">
          <TextInput source="price" />
        </WizardForm.Step>
      </WizardForm>
    </StoryWrapper>
  );
};
Object.assign(CustomToolbar, storyArgs);
