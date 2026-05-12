import React from "react";
import { CoreAdminContext, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { TextArrayField, ThemeProvider } from "@/components/admin";

export default {
  title: "Fields/TextArrayField",
};

const record = {
  id: 1,
  title: "War and Peace",
  genres: [
    "Fiction",
    "Historical Fiction",
    "Classic Literature",
    "Russian Literature",
  ],
  emptyArray: [],
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
    <TextArrayField source="genres" />
  </Wrapper>
);

export const Secondary = () => (
  <Wrapper>
    <TextArrayField source="genres" variant="secondary" />
  </Wrapper>
);

export const Empty = () => (
  <Wrapper>
    <TextArrayField source="emptyArray" empty="No genres" />
  </Wrapper>
);
