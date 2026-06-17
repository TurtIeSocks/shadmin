import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  InfiniteList,
  ShowGuesser,
  SimpleList,
} from "@/components/admin";

export default {
  title: "Page components/InfiniteList",
};

const books = Array.from({ length: 53 }).map((_, i) => ({
  id: i + 1,
  title: `Book #${i + 1}`,
  author: i % 2 === 0 ? "Leo Tolstoy" : "Jane Austen",
  year: 1800 + ((i * 7) % 200),
}));

type Book = (typeof books)[number];

const dataProvider = fakeRestDataProvider({ books }) as DataProvider;

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <InfiniteList perPage={10}>
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
              <DataTable.Col source="year" />
            </DataTable>
          </InfiniteList>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

const emptyDataProvider = fakeRestDataProvider({ books: [] }) as DataProvider;

export const WithEmpty = () => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={emptyDataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <InfiniteList
            perPage={10}
            empty={
              <p className="text-center py-8 text-muted-foreground">
                No books yet.
              </p>
            }
          >
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
            </DataTable>
          </InfiniteList>
        }
      />
    </Admin>
  </TestMemoryRouter>
);

const InfiniteListHelp = () => (
  <div className="p-4 bg-muted rounded text-sm">
    <p className="font-medium mb-2">Tips</p>
    <p>Scroll down to load more records automatically.</p>
  </div>
);

export const WithAside = () => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <InfiniteList perPage={10} aside={<InfiniteListHelp />}>
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
            </DataTable>
          </InfiniteList>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithSimpleList = () => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <InfiniteList perPage={10}>
            <SimpleList<Book>
              primaryText={(record) => record.title}
              secondaryText={(record) => record.author}
              tertiaryText={(record) => record.year}
            />
          </InfiniteList>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);
