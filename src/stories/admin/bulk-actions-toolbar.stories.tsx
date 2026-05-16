import React from "react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { MemoryRouter } from "react-router";

import { BulkActionsToolbar } from "@/components/admin/bulk-actions-toolbar";
import { BulkDeleteButton } from "@/components/admin/bulk-delete-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Display/BulkActionsToolbar",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const dataProvider = fakeRestProvider(
  {
    posts: [
      { id: 1, title: "Post 1" },
      { id: 2, title: "Post 2" },
      { id: 3, title: "Post 3" },
    ],
  },
  false,
);

const Wrapper = ({
  children,
  selectedIds = [1, 2],
}: React.PropsWithChildren<{ selectedIds?: number[] }>) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })}
        store={memoryStore()}
      >
        <ResourceDefinitionContextProvider
          definitions={{ posts: { name: "posts" } }}
        >
          <ResourceContextProvider value="posts">
            <ListContext.Provider
              value={
                {
                  selectedIds,
                  onUnselectItems: () => {},
                  total: 3,
                } as never
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

export const Basic = () => (
  <Wrapper>
    <BulkActionsToolbar />
  </Wrapper>
);

export const CustomChildren = () => (
  <Wrapper>
    <BulkActionsToolbar>
      <BulkDeleteButton />
    </BulkActionsToolbar>
  </Wrapper>
);

export const Empty = () => (
  <Wrapper selectedIds={[]}>
    {/* Renders nothing when no items are selected */}
    <BulkActionsToolbar />
    <p className="text-sm text-muted-foreground">
      (Toolbar is hidden when no rows are selected)
    </p>
  </Wrapper>
);
