import React from "react";
import { CoreAdminContext, RecordContextProvider } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { FunctionField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/FunctionField",
};

type Person = {
  id: number;
  first_name: string;
  last_name: string;
  views: number;
};

const record: Person = {
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
    <FunctionField<Person>
      source="last_name"
      render={(r) => `${r.first_name} ${r.last_name}`}
    />
  </Wrapper>
);

export const Formatted = () => (
  <Wrapper>
    <FunctionField<Person>
      source="views"
      render={(r) => `${r.views.toLocaleString()} views`}
    />
  </Wrapper>
);
