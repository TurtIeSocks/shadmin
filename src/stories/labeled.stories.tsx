import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { Labeled, TextField, NumberField, ThemeProvider } from "@/components/admin";

export default {
  title: "Layout/Labeled",
  parameters: { docs: { codePanel: true } },
};

const record = { id: 1, title: "War and Peace", author: "Leo Tolstoy", year: 1869 };

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={record}>{children}</RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

/** Auto-derives the label from the field's `source` prop. */
export const AutoLabel = () => (
  <Wrapper>
    <div className="flex flex-col gap-4">
      <Labeled>
        <TextField source="title" />
      </Labeled>
      <Labeled>
        <TextField source="author" />
      </Labeled>
      <Labeled>
        <NumberField source="year" />
      </Labeled>
    </div>
  </Wrapper>
);

/** Override the label with a custom string. */
export const CustomLabel = () => (
  <Wrapper>
    <div className="flex flex-col gap-4">
      <Labeled label="Book title">
        <TextField source="title" />
      </Labeled>
      <Labeled label="Author name">
        <TextField source="author" />
      </Labeled>
    </div>
  </Wrapper>
);

/** Passing `label={false}` on Labeled hides the label entirely. */
export const HiddenLabel = () => (
  <Wrapper>
    <Labeled label={false}>
      <TextField source="title" />
    </Labeled>
  </Wrapper>
);

/** When the child already has `label={false}`, no label is shown. */
export const ChildLabelFalse = () => (
  <Wrapper>
    <Labeled>
      {/* @ts-expect-error intentional false label */}
      <TextField source="title" label={false} />
    </Labeled>
  </Wrapper>
);

/** `fullWidth` makes the component fill the container. */
export const FullWidth = () => (
  <Wrapper>
    <div className="w-80 border rounded p-4">
      <Labeled fullWidth>
        <TextField source="title" />
      </Labeled>
    </div>
  </Wrapper>
);

/** Nested `<Labeled>` components do not produce a double label. */
export const NoDoubleLabel = () => (
  <Wrapper>
    <Labeled label="Outer">
      <Labeled>
        <TextField source="title" />
      </Labeled>
    </Labeled>
  </Wrapper>
);
