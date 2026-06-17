import React, { useRef } from "react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { BulkDeleteButton, ThemeProvider } from "@/components/admin";
import fakeRestDataProvider from "ra-data-fakerest";

export default {
  title: "Data Edition/BulkDeleteButton",
};

const dataProvider = fakeRestDataProvider({
  posts: [
    { id: 1, title: "Hello world" },
    { id: 2, title: "Lorem ipsum" },
  ],
});

const Wrapper = ({
  children,
  i18nProvider,
}: React.PropsWithChildren<{
  i18nProvider?: ReturnType<typeof polyglotI18nProvider>;
}>) => (
  <ThemeProvider>
    <CoreAdminContext
      dataProvider={dataProvider}
      i18nProvider={
        i18nProvider ??
        polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })
      }
      store={memoryStore()}
    >
      <ResourceDefinitionContextProvider
        definitions={{ posts: { name: "posts" } }}
      >
        <ResourceContextProvider value="posts">
          <ListContext.Provider
            value={{ selectedIds: [1, 2], onUnselectItems: () => {} } as never}
          >
            {children}
          </ListContext.Provider>
        </ResourceContextProvider>
      </ResourceDefinitionContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <BulkDeleteButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <BulkDeleteButton label="Remove selected" />
  </Wrapper>
);

export const WithRef = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Wrapper>
      <BulkDeleteButton ref={ref} />
    </Wrapper>
  );
};

export const CustomIcon = () => (
  <Wrapper>
    <BulkDeleteButton icon={<span>🗑️</span>} />
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
              delete: "Remove posts",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <BulkDeleteButton />
  </Wrapper>
);
