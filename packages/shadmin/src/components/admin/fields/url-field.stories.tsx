import type { PropsWithChildren } from "react";
import { CoreAdminContext, RecordContextProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider, UrlField } from "@/components/admin";

export default {
  title: "Data Display/UrlField",
};

const record = {
  id: 1,
  name: "John Doe",
  website: "https://example.org",
};

const Wrapper = ({
  children,
  value = record,
}: PropsWithChildren<{ value?: Record<string, unknown> }>) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={value}>{children}</RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <UrlField source="website" />
  </Wrapper>
);

export const NewTab = () => (
  <Wrapper>
    <UrlField source="website" target="_blank" rel="noopener noreferrer" />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper value={{ id: 1, name: "John Doe" }}>
    <UrlField source="website" empty="No website" />
  </Wrapper>
);

export const CustomContent = () => (
  <Wrapper>
    <UrlField source="website" content="Visit homepage" />
  </Wrapper>
);
