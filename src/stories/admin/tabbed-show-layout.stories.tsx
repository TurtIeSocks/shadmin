import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
} from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  TabbedShowLayout,
  Labeled,
  TextField,
  NumberField,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Page components/TabbedShowLayout",
  parameters: { docs: { codePanel: true } },
};

const record = {
  id: 1,
  title: "Page components/TabbedShowLayout",
  author: "Leo Tolstoy",
  summary:
    "War and Peace broadly focuses on Napoleon's invasion of Russia and the impact it had on Tsarist society.",
  year: 1869,
  views: 42000,
};

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
      <ResourceContextProvider value="books">
        <RecordContextProvider value={record}>{children}</RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

/** Two tabs with fields auto-wrapped in Labeled. */
export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <Wrapper theme={theme}>
    <TabbedShowLayout syncWithLocation={false}>
      <TabbedShowLayout.Tab label="Content">
        <TextField source="title" />
        <TextField source="author" />
        <TextField source="summary" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Metadata">
        <NumberField source="year" />
        <NumberField source="views" />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Wrapper>
);
Object.assign(Basic, storyArgs);

/** Three tabs demonstrating multi-tab navigation. */
export const ThreeTabs = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <Wrapper theme={theme}>
    <TabbedShowLayout syncWithLocation={false}>
      <TabbedShowLayout.Tab label="Title">
        <TextField source="title" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Author">
        <TextField source="author" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Stats">
        <NumberField source="year" />
        <NumberField source="views" />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Wrapper>
);
Object.assign(ThreeTabs, storyArgs);

/** Tab with a count badge — useful for related record counts. */
export const WithCount = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <Wrapper theme={theme}>
    <TabbedShowLayout syncWithLocation={false}>
      <TabbedShowLayout.Tab label="Content">
        <TextField source="title" />
        <TextField source="author" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Reviews" count={27}>
        <TextField source="summary" />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Wrapper>
);
Object.assign(WithCount, storyArgs);

/**
 * Use explicit `<Labeled>` wrappers to override the auto-derived label.
 * Pass `label={false}` to the field itself so the inner auto-label is
 * suppressed, then let the wrapping `<Labeled>` supply the text.
 */
export const CustomLabel = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => (
  <Wrapper theme={theme}>
    <TabbedShowLayout syncWithLocation={false}>
      <TabbedShowLayout.Tab label="Details">
        <Labeled label="Book Title">
          <TextField source="title" />
        </Labeled>
        <Labeled label="Written By">
          <TextField source="author" />
        </Labeled>
        <Labeled label="Publication Year">
          <NumberField source="year" />
        </Labeled>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Wrapper>
);
Object.assign(CustomLabel, storyArgs);
