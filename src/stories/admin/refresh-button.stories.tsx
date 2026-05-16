import React from "react";
import { CoreAdminContext, memoryStore, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "UI & Layout/RefreshButton",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <TestMemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })}
        store={memoryStore()}
      >
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <RefreshButton />
  </Wrapper>
);

export const InToolbar = () => (
  <Wrapper>
    <div className="flex flex-row items-center gap-2 p-2 border rounded">
      <span className="text-sm text-muted-foreground">Toolbar:</span>
      <RefreshButton />
    </div>
  </Wrapper>
);
