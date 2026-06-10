import type { PropsWithChildren } from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { EmailField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/EmailField",
};

const record = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.org",
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
    <EmailField source="email" />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper value={{ id: 1, name: "John Doe" }}>
    <EmailField source="email" empty="—" />
  </Wrapper>
);

export const CustomClass = () => (
  <Wrapper>
    <EmailField source="email" className="text-primary underline" />
  </Wrapper>
);
