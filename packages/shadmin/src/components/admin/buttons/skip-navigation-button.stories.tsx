import React from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { SkipNavigationButton, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/SkipNavigationButton",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          { allowMissing: true },
        )}
        store={memoryStore()}
      >
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <p className="text-sm text-muted-foreground">
      The Skip Navigation button is visually hidden until focused. Press Tab to
      focus it.
    </p>
    <SkipNavigationButton />
    <main id="main-content" className="mt-8 p-4 border rounded">
      Main content (id="main-content") — the skip-nav button moves focus here.
    </main>
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <SkipNavigationButton label="Jump to content" />
    <main id="main-content" className="mt-8 p-4 border rounded">
      Main content
    </main>
  </Wrapper>
);

export const Basic = Default;
