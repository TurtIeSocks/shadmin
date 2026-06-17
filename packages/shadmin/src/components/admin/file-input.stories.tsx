import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  FileInput,
  FileField,
  ImageField,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Data Edition/FileInput",
};

const record = {
  id: 1,
  title: "Annual report",
  attachments: [
    { src: "https://example.org/document.pdf", title: "Cover image" },
    { src: "https://example.org/picture.png", title: "Project plan" },
  ],
  pictures: [
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop",
      title: "Meeting notes",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop&sat=-100",
      title: "Budget spreadsheet",
    },
  ],
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
    <FileInput source="attachments" multiple>
      <FileField source="src" title="title" target="_blank" />
    </FileInput>
  </Wrapper>
);

export const WithImageField = () => (
  <Wrapper>
    <FileInput source="pictures" multiple accept={{ "image/*": [] }}>
      <ImageField
        source="src"
        title="title"
        className="[&_img]:h-24 [&_img]:w-24 [&_img]:rounded-md [&_img]:object-cover"
      />
    </FileInput>
  </Wrapper>
);
