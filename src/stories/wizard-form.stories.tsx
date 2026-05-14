import { type ReactNode, useState } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
} from "ra-core";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { WizardForm } from "@/components/admin/wizard-form";
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
  title: "Forms/WizardForm",
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
