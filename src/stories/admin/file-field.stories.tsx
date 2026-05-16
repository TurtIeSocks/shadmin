import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { FileField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/FileField",
};

const record = {
  id: 1,
  title: "Data Display/FileField",
  attachments: [
    { src: "https://example.org/document.pdf", title: "Data Display/FileField" },
    { src: "https://example.org/picture.png", title: "Data Display/FileField" },
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
