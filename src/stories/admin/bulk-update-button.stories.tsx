import React, { useRef } from "react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  BulkUpdateButton,
  BulkUpdateWithConfirmButton,
  BulkUpdateWithUndoButton,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Data Edition/BulkUpdateButton",
};

const dataProvider = fakeRestDataProvider({
  posts: [
    { id: 1, title: "Hello world", views: 42 },
    { id: 2, title: "Lorem ipsum", views: 17 },
  ],
});

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          { allowMissing: true },
        )}
        store={memoryStore()}
      >
        <ResourceDefinitionContextProvider
          definitions={{ posts: { name: "posts" } }}
        >
          <ResourceContextProvider value="posts">
            <ListContext.Provider
              value={
                { selectedIds: [1, 2], onUnselectItems: () => {} } as never
              }
            >
              {children}
            </ListContext.Provider>
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <BulkUpdateButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const WithConfirm = () => (
  <Wrapper>
    <BulkUpdateWithConfirmButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const WithUndo = () => (
  <Wrapper>
    <BulkUpdateWithUndoButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const WithRef = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Wrapper>
      <BulkUpdateButton ref={ref} label="Reset Views" data={{ views: 0 }} />
    </Wrapper>
  );
};

export const CustomIcon = () => (
  <Wrapper>
    <BulkUpdateButton icon={<span>🔄</span>} label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const Basic = Default;
