import {
  CoreAdminContext,
  TestMemoryRouter,
  memoryStore,
  useTranslate,
} from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { ThemeProvider } from "@/components/admin";
import { I18nKeyEditor } from "@/components/admin/widgets/i18n-key-editor";

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
