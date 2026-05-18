import React, { useRef } from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ListButton, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/ListButton",
};

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
              hasList: true,
            },
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

export const Default = () => (
  <Wrapper>
    <ListButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <ListButton label="All Posts" />
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
              list: "Back to posts",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <ListButton />
  </Wrapper>
);

export const WithRef = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Wrapper>
      <ListButton ref={ref} />
    </Wrapper>
  );
};

export const CustomIcon = () => (
  <Wrapper>
    <ListButton icon={<span>📋</span>} />
  </Wrapper>
);

export const Basic = Default;
