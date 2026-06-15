import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { RichTextField, ThemeProvider } from "@/components/admin";

export default {
  title: "Rich Text Input/RichTextField",
};

const record = {
  id: 1,
  title: "War and Peace",
  body: '<p>Hello <strong>world</strong>! Visit <a href="https://example.com">our site</a>.</p>',
  empty: "",
  malicious:
    "<p>Safe</p><img src=x onerror=\"alert('xss')\"><script>alert('xss')</script>",
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
    <RichTextField source="body" />
  </Wrapper>
);

export const StripTags = () => (
  <Wrapper>
    <RichTextField source="body" stripTags />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <RichTextField source="empty" empty="No description" />
  </Wrapper>
);

export const Sanitized = () => (
  <Wrapper>
    <RichTextField source="malicious" />
  </Wrapper>
);
