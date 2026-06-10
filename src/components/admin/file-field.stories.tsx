import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { FileField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/FileField",
};

const record = {
  id: 1,
  title: "Annual report",
  attachments: [
    { src: "https://example.org/document.pdf", title: "Cover image" },
    { src: "https://example.org/picture.png", title: "Project plan" },
  ],
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={record}>{children}</RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <FileField source="attachments" src="src" title="title" />
  </Wrapper>
);

export const WithPing = () => (
  <Wrapper>
    <FileField
      source="attachments"
      src="src"
      title="title"
      ping="https://example.org/track-download"
    />
  </Wrapper>
);

export const WithRel = () => (
  <Wrapper>
    <FileField
      source="attachments"
      src="src"
      title="title"
      target="_blank"
      rel="noopener noreferrer"
    />
  </Wrapper>
);
