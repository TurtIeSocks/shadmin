import React from "react";
import {
  CoreAdminContext,
  Form,
  RecordContextProvider,
  ResourceContextProvider,
} from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider";
import {
  Toolbar,
  SaveButton,
  CancelButton,
  TextInput,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Forms/Toolbar",
  parameters: { docs: { codePanel: true } },
};

const record = { id: 1, title: "Hello World" };

const storyArgs = {
  args: { theme: "system" as const },
  argTypes: {
    theme: { type: "select" as const, options: ["light", "dark", "system"] },
  },
};

const Wrapper = ({
  children,
  theme = "system",
}: {
  children: React.ReactNode;
  theme?: "system" | "light" | "dark";
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <ResourceContextProvider value="posts">
        <RecordContextProvider value={record}>
          <Form>{children}</Form>
        </RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

/**
 * Default toolbar: `<SaveButton>` on the left, `<DeleteButton>` on the right.
 * This is the standard layout for Edit forms.
 */
export const Default = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <Wrapper theme={theme}>
    <TextInput source="title" />
    <Toolbar />
  </Wrapper>
);
Object.assign(Default, storyArgs);

/** Replace the defaults with a single Save button (useful for Create views). */
export const SaveOnly = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <Wrapper theme={theme}>
    <TextInput source="title" />
    <Toolbar>
      <SaveButton />
    </Toolbar>
  </Wrapper>
);
Object.assign(SaveOnly, storyArgs);

/** Cancel + Save layout — same as `FormToolbar` but using `Toolbar`. */
export const CancelAndSave = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <Wrapper theme={theme}>
    <TextInput source="title" />
    <Toolbar>
      <div className="flex gap-2">
        <CancelButton />
        <SaveButton />
      </div>
    </Toolbar>
  </Wrapper>
);
Object.assign(CancelAndSave, storyArgs);

/** Custom label on the Save button. */
export const CustomSaveLabel = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <Wrapper theme={theme}>
    <TextInput source="title" />
    <Toolbar>
      <SaveButton label="Publish" />
    </Toolbar>
  </Wrapper>
);
Object.assign(CustomSaveLabel, storyArgs);
