import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider.ts";
import { FunctionField, ThemeProvider } from "@/components/admin";

export default {
  title: "Fields/FunctionField",
};

const record = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  views: 1234,
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
    <FunctionField
      source="last_name"
      render={(r) => `${r.first_name} ${r.last_name}`}
    />
  </Wrapper>
);

export const Formatted = () => (
  <Wrapper>
    <FunctionField
      source="views"
      render={(r) => `${r.views.toLocaleString()} views`}
    />
  </Wrapper>
);
