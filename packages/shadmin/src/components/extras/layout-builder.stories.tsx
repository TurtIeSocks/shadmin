import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { LayoutBuilder } from "@/components/extras";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ posts: [] }, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

const FIELDS = ["id", "title", "author", "publishedAt", "views"];

export default {
  title: "Extras/LayoutBuilder",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <Wrapper>
    <LayoutBuilder availableFields={FIELDS} mode="list-columns" />
  </Wrapper>
);

export const WithStoredOrder = () => (
  <Wrapper>
    <LayoutBuilder
      availableFields={FIELDS}
      mode="list-columns"
      defaultOrder={["title", "id", "author", "publishedAt", "views"]}
    />
  </Wrapper>
);

export const CustomStoreKey = () => (
  <Wrapper>
    <LayoutBuilder
      availableFields={FIELDS}
      mode="list-columns"
      storeKey="my-custom-layout"
    />
  </Wrapper>
);
