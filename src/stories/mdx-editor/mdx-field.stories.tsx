import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";

import { ThemeProvider } from "@/components/admin";
import { MdxField } from "@/components/mdx-editor";
import { i18nProvider } from "@/lib/i18n-provider";
import "@mdxeditor/editor/style.css";

const record = {
  id: 1,
  title: "MDX Editor/MdxField",
  body: "# Hello\n\nThis is **markdown** content with a [link](https://example.com).",
  empty: "",
};

export default {
  title: "MDX Editor/MdxField",
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
    <MdxField source="body" />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <MdxField source="empty" empty="No content yet" />
  </Wrapper>
);
