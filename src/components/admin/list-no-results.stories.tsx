import React from "react";
import {
  CoreAdminContext,
  ListContextProvider,
  type RaRecord,
  ResourceContextProvider,
  memoryStore,
  useList,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ListNoResults, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/ListNoResults",
};

const Wrapper = ({
  children,
  filter,
}: React.PropsWithChildren<{
  filter?: Record<string, unknown>;
}>) => {
  const listContext = useList<RaRecord>({
    data: [] as RaRecord[],
    filter,
  });
  return (
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext
          i18nProvider={polyglotI18nProvider(
            () => defaultMessages,
            "en",
            undefined,
            { allowMissing: true },
          )}
          store={memoryStore()}
        >
          <ResourceContextProvider value="posts">
            <ListContextProvider value={listContext}>
              {children}
            </ListContextProvider>
          </ResourceContextProvider>
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export const NoFilters = () => (
  <Wrapper>
    <ListNoResults />
  </Wrapper>
);

export const WithFilters = () => (
  <Wrapper filter={{ q: "no-match" }}>
    <ListNoResults />
  </Wrapper>
);

export const Basic = NoFilters;
