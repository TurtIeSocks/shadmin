import React, { useRef } from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { CreateButton, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/CreateButton",
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
              hasCreate: true,
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

export const Basic = () => (
  <Wrapper>
    <CreateButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <CreateButton label="New Post" />
  </Wrapper>
);

export const NoScrollToTop = () => (
  <Wrapper>
    <CreateButton scrollToTop={false} />
  </Wrapper>
);

export const WithRef = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Wrapper>
      <CreateButton ref={ref} />
    </Wrapper>
  );
};

export const CustomIcon = () => (
  <Wrapper>
    <CreateButton icon={<span>✏️</span>} />
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
              create: "Write a new post",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  >
    <CreateButton />
  </Wrapper>
);
