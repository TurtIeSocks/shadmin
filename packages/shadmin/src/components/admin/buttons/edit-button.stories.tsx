import React, { useRef } from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { EditButton, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/EditButton",
};

const record = { id: 1, title: "Hello world" };

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
              hasEdit: true,
              hasShow: true,
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

export const Basic = () => (
  <Wrapper>
    <EditButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <EditButton label="Modify" />
  </Wrapper>
);

export const NoScrollToTop = () => (
  <Wrapper>
    <EditButton scrollToTop={false} />
  </Wrapper>
);

export const WithRef = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Wrapper>
      <EditButton ref={ref} />
    </Wrapper>
  );
};

export const CustomIcon = () => (
  <Wrapper>
    <EditButton icon={<span>✏️</span>} />
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
              edit: "Edit this post",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <EditButton />
  </Wrapper>
);
