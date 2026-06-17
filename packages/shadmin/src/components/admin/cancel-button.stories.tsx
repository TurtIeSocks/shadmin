import React from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";

import { CancelButton } from "@/components/admin/cancel-button";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "Data Edition/CancelButton",
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
    <CancelButton />
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <CancelButton disabled />
  </Wrapper>
);

export const CustomClassName = () => (
  <Wrapper>
    <CancelButton className="bg-muted" />
  </Wrapper>
);

export const WithRef = () => {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <Wrapper>
      <CancelButton ref={ref} />
    </Wrapper>
  );
};
