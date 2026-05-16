import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ChipField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/ChipField",
};

const record = {
  id: 1,
  name: "John Doe",
  category: "Premium",
  status: "",
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
    <ChipField source="category" />
  </Wrapper>
);

export const Secondary = () => (
  <Wrapper>
    <ChipField source="category" variant="secondary" />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <ChipField source="status" empty="No status" />
  </Wrapper>
);
