import {
  CoreAdminContext,
  ListContext,
  RecordContextProvider,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { SchemaDrivenView } from "@/components/extras";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const SCHEMA = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    email: { type: "string", format: "email" },
    publishedAt: { type: "string", format: "date" },
    published: { type: "boolean" },
    status: { type: "string", enum: ["draft", "review", "published"] },
  },
} as const;

const SAMPLE = {
  id: 1,
  title: "First post",
  email: "alice@example.com",
  publishedAt: "2026-05-16",
  published: true,
  status: "published",
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ posts: [SAMPLE] }, false)}
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

const ListWrapper = ({ children }: { children: React.ReactNode }) => (
  <Wrapper>
    <ListContext.Provider
      value={
        {
          data: [SAMPLE],
          isLoading: false,
          isFetching: false,
          sort: { field: "id", order: "ASC" },
          onSelect: () => {},
          onToggleItem: () => {},
        } as never
      }
    >
      {children}
    </ListContext.Provider>
  </Wrapper>
);

export default { title: "Extras/SchemaDrivenView" };

export const Show = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView schema={SCHEMA} mode="show" />
    </RecordContextProvider>
  </Wrapper>
);

export const Edit = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView schema={SCHEMA} mode="edit" />
    </RecordContextProvider>
  </Wrapper>
);

export const Basic = Show;

export const ListMode = () => (
  <ListWrapper>
    <SchemaDrivenView schema={SCHEMA} mode="list" />
  </ListWrapper>
);

export const WithOverride = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView
        schema={SCHEMA}
        mode="show"
        overrides={{
          title: <strong data-override-title>{SAMPLE.title}</strong>,
        }}
      />
    </RecordContextProvider>
  </Wrapper>
);
