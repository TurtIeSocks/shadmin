import React from "react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { SelectAllButton } from "@/components/admin/select-all-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Edition/SelectAllButton",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({
  children,
  selectedIds,
  total = 50,
  pageSize = 10,
}: React.PropsWithChildren<{
  selectedIds?: number[];
  total?: number;
  pageSize?: number;
}>) => {
  const data = Array.from({ length: pageSize }).map((_, i) => ({
    id: i + 1,
  }));
  const ids = selectedIds ?? data.map((record) => record.id);
  return (
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          {
            allowMissing: true,
          },
        )}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          <ListContext.Provider
            value={
              {
                selectedIds: ids,
                onSelect: () => {},
                onSelectAll: () => {},
                data,
                total,
              } as never
            }
          >
            <div className="p-4">{children}</div>
          </ListContext.Provider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
};

export const Basic = () => (
  <Wrapper>
    <SelectAllButton />
  </Wrapper>
);

export const WithLimit = () => (
  <Wrapper total={500}>
    <SelectAllButton limit={50} />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <SelectAllButton label="Select everything" />
  </Wrapper>
);
