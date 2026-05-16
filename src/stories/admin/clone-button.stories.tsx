import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { CloneButton, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/CloneButton",
};

const record = { id: 1, title: "Data Edition/CloneButton" };

const Wrapper = ({
  children,
  i18nProvider,
}: React.PropsWithChildren<{
  i18nProvider?: ReturnType<typeof polyglotI18nProvider>;
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
            posts: {
              name: "posts",
              hasCreate: true,
            },
          }}
        >
          <ResourceContextProvider value="posts">
            <RecordContextProvider value={record}>
              {children}
            </RecordContextProvider>
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <CloneButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <CloneButton label="Duplicate" />
  </Wrapper>
);

export const ResourceSpecificLabel = () => (
  <Wrapper
    i18nProvider={polyglotI18nProvider(
      () => ({
        ...defaultMessages,
        resources: {
          posts: {
            action: {
              clone: "Duplicate this post",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <CloneButton />
  </Wrapper>
);

export const Basic = Default;
