import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
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
