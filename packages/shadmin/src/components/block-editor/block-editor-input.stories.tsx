import type { ReactNode } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  required,
} from "shadmin-core";
import { useFormContext, useWatch } from "react-hook-form";

import { SimpleForm, ThemeProvider } from "@/components/admin";
import { BlockEditorInput } from "@/components/block-editor/block-editor-input";
import { Button } from "@/components/ui/button";
import { i18nProvider } from "@/lib/i18n-provider";

export default { title: "Block Editor/BlockEditorInput" };

const record = {
  id: 1,
  body: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Initial content" }],
      },
    ],
  },
};

const FormValues = () => (
  <pre className="whitespace-pre-wrap text-xs">
    {JSON.stringify(useWatch(), null, 2)}
  </pre>
);

const Wrapper = ({
  children,
  defaultValues = record,
}: {
  children: ReactNode;
  defaultValues?: Record<string, unknown>;
}) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={defaultValues}>
        <SimpleForm>{children}</SimpleForm>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const BodyHelper = () => {
  const { setValue } = useFormContext();
  return (
    <Button
      type="button"
      onClick={() => {
        setValue(
          "body",
          {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Value changed externally." }],
              },
            ],
          },
          { shouldDirty: true },
        );
      }}
    >
      Change value
    </Button>
  );
};

export const Basic = () => (
  <Wrapper>
    <BlockEditorInput source="body" />
    <FormValues />
  </Wrapper>
);

export const Validation = () => (
  <Wrapper defaultValues={{ id: 1, body: null }}>
    <BlockEditorInput source="body" validate={required()} />
  </Wrapper>
);

export const ExternalChanges = () => (
  <Wrapper>
    <BlockEditorInput source="body" />
    <BodyHelper />
    <FormValues />
  </Wrapper>
);
