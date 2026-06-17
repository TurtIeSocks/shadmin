import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  Admin,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  ShowGuesser,
  TopToolbar,
} from "@/components/admin";

export default {
  title: "UI & Layout/TopToolbar",
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author: "Leo Tolstoy" },
    { id: 2, title: "Lorem ipsum", author: "Jane Austen" },
    { id: 3, title: "First post", author: "Oscar Wilde" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({ actions }: { actions?: React.ReactElement }) => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={polyglotI18nProvider(
        () => defaultMessages,
        "en",
        undefined,
        { allowMissing: true },
      )}
      store={memoryStore()}
    >
      <Resource
        name="posts"
        list={
          <List actions={actions}>
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
            </DataTable>
          </List>
        }
        create={() => <div>Create posts</div>}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper
    actions={
      <TopToolbar>
        <CreateButton />
        <ExportButton />
      </TopToolbar>
    }
  />
);

export const SingleAction = () => (
  <Wrapper
    actions={
      <TopToolbar>
        <CreateButton />
      </TopToolbar>
    }
  />
);

export const Standalone = () => (
  <TopToolbar>
    <CreateButton resource="posts" />
    <ExportButton resource="posts" />
  </TopToolbar>
);
