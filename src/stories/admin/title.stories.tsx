import { CoreAdminContext } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider, Title, TitlePortal } from "@/components/admin";

export default {
  title: "UI & Layout/Title",
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
      >
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
          <TitlePortal />
        </header>
        <main className="p-4">{children}</main>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <Title title="Hello world" />
    Page content
  </Wrapper>
);

export const DefaultTitle = () => (
  <Wrapper>
    <Title defaultTitle="Fallback title" />
    Page content (only `defaultTitle` is set).
  </Wrapper>
);

export const TranslatedTitle = () => (
  <Wrapper>
    <Title title="ra.page.dashboard" />
    Page content (`title="ra.page.dashboard"` is translated).
  </Wrapper>
);

export const ReactElementTitle = () => (
  <Wrapper>
    <Title
      title={
        <span>
          Hello, <strong>world!</strong>
        </span>
      }
    />
    Page content
  </Wrapper>
);
