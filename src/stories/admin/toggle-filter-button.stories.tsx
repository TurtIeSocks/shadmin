import React from "react";
import {
  CoreAdminContext,
  ListContextProvider,
  ResourceContextProvider,
  memoryStore,
  useList,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Display/ToggleFilterButton",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = [
  { id: 1, title: "Hello", status: "published" },
  { id: 2, title: "Draft post", status: "draft" },
  { id: 3, title: "Another", status: "published" },
];

const Wrapper = ({ children }: React.PropsWithChildren) => {
  const listContext = useList({ data });
  return (
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          <ListContextProvider value={listContext}>
            <div className="p-4 max-w-xs space-y-1">{children}</div>
          </ListContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
};

export const Basic = () => (
  <Wrapper>
    <p className="text-sm font-semibold">Status</p>
    <ToggleFilterButton label="Published" value={{ status: "published" }} />
    <ToggleFilterButton label="Draft" value={{ status: "draft" }} />
  </Wrapper>
);

export const LargeButtons = () => (
  <Wrapper>
    <p className="text-sm font-semibold">Status (lg)</p>
    <ToggleFilterButton
      label="Published"
      value={{ status: "published" }}
      size="lg"
    />
    <ToggleFilterButton label="Draft" value={{ status: "draft" }} size="lg" />
  </Wrapper>
);

export const DefaultButtons = () => (
  <Wrapper>
    <p className="text-sm font-semibold">Status (default)</p>
    <ToggleFilterButton
      label="Published"
      value={{ status: "published" }}
      size="default"
    />
    <ToggleFilterButton
      label="Draft"
      value={{ status: "draft" }}
      size="default"
    />
  </Wrapper>
);
