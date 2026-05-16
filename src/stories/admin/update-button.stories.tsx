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
import fakeRestDataProvider from "ra-data-fakerest";
import {
  ThemeProvider,
  UpdateButton,
  UpdateWithConfirmButton,
  UpdateWithUndoButton,
} from "@/components/admin";

export default {
  title: "Data Edition/UpdateButton",
};

const record = { id: 1, title: "Data Edition/UpdateButton", views: 42 };

const dataProvider = fakeRestDataProvider({
  posts: [record],
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
    <UpdateButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const WithConfirm = () => (
  <Wrapper>
    <UpdateWithConfirmButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const WithUndo = () => (
  <Wrapper>
    <UpdateWithUndoButton label="Reset Views" data={{ views: 0 }} />
  </Wrapper>
);

export const Basic = Default;
