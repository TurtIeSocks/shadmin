import React from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";

import { NotFound } from "@/components/admin/feedback/not-found";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";

export default {
  title: "UI & Layout/NotFound",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
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
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <NotFound />
  </Wrapper>
);
