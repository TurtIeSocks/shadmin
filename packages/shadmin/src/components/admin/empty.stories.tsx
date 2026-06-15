import React from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { Empty, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/Empty",
};

const Wrapper = ({
  children,
  i18nProvider,
  hasCreate = true,
}: React.PropsWithChildren<{
  i18nProvider?: ReturnType<typeof polyglotI18nProvider>;
  hasCreate?: boolean;
}>) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={
          i18nProvider ??
          polyglotI18nProvider(() => defaultMessages, "en", undefined, {
            allowMissing: true,
          })
        }
        store={memoryStore()}
      >
        <ResourceDefinitionContextProvider
          definitions={{
            posts: { name: "posts", hasCreate },
          }}
        >
          <ResourceContextProvider value="posts">
            {children}
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <Empty />
  </Wrapper>
);

export const WithoutCreate = () => (
  <Wrapper hasCreate={false}>
    <Empty />
  </Wrapper>
);

export const ResourceSpecificLabel = () => (
  <Wrapper
    i18nProvider={polyglotI18nProvider(
      () => ({
        ...defaultMessages,
        resources: {
          posts: {
            empty: "Your post list is empty.",
            invite: "Why not write your first post?",
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <Empty />
  </Wrapper>
);
