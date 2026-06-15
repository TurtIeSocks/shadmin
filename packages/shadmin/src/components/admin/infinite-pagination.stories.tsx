import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  InfiniteList,
  InfinitePagination,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "Data Display/InfinitePagination",
};

const books = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  title: `Book #${i + 1}`,
  author: i % 2 === 0 ? "Leo Tolstoy" : "Jane Austen",
}));

const dataProvider = fakeRestDataProvider({ books }) as DataProvider;

const Wrapper = ({ pagination }: { pagination?: React.ReactNode }) => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <InfiniteList perPage={10} pagination={pagination}>
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

export const Basic = () => <Wrapper />;

export const CustomClassName = () => (
  <Wrapper pagination={<InfinitePagination className="py-8" />} />
);
