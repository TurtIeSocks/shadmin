import {
  CoreAdminContext,
  TestMemoryRouter,
  memoryStore,
  useTranslate,
} from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { I18nKeyEditor, ThemeProvider } from "@/components/admin";

const dataProvider = fakeRestProvider({}, false);

const baseI18n = polyglotI18nProvider(
  () => englishMessages,
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);

const CallerComponent = () => {
  const translate = useTranslate();
  return (
    <ul>
      <li>{translate("custom.foo.bar")}</li>
      <li>{translate("custom.foo.baz")}</li>
      <li>{translate("custom.missing.key")}</li>
      <li>{translate("ra.action.save")}</li>
    </ul>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={baseI18n}
        store={memoryStore()}
      >
        {children}
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/I18nKeyEditor" };

export const Basic = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);

export const Hidden = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n} defaultOpen={false}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);

export const NoExport = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n} showExport={false}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);
