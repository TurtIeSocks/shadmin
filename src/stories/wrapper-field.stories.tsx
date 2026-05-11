import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider.ts";
import {
  TextField,
  ThemeProvider,
  WrapperField,
} from "@/components/admin";

export default {
  title: "Fields/WrapperField",
};

const record = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
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
    <WrapperField label="Name" source="last_name">
      <TextField source="first_name" />
      {" "}
      <TextField source="last_name" />
    </WrapperField>
  </Wrapper>
);
