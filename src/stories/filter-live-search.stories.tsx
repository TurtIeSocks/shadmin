import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  FilterLiveSearch,
  List,
  ListPagination,
  ShowGuesser,
} from "@/components/admin";
import { Card } from "@/components/ui/card";

export default {
  title: "Filters/FilterLiveSearch",
};

const data = {
  books: [
    { id: 1, title: "War and Peace", author: "Leo Tolstoy" },
    { id: 2, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 3, title: "The Picture of Dorian Gray", author: "Oscar Wilde" },
    { id: 4, title: "Madame Bovary", author: "Gustave Flaubert" },
    { id: 5, title: "Le Petit Prince", author: "Antoine de Saint-Exupéry" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({
  sidebar = (
    <Card className="p-4 w-60 self-start">
      <FilterLiveSearch />
    </Card>
  ),
}: {
  sidebar?: React.ReactNode;
}) => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <List pagination={false}>
            <div className="flex flex-row gap-4">
              {sidebar}
              <div className="flex-1">
                <DataTable>
                  <DataTable.Col source="id" />
                  <DataTable.Col source="title" />
                  <DataTable.Col source="author" />
                </DataTable>
                <ListPagination className="justify-start mt-2" />
              </div>
            </div>
          </List>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => <Wrapper />;

export const CustomSource = () => (
  <Wrapper
    sidebar={
      <Card className="p-4 w-60 self-start">
        <FilterLiveSearch source="title" placeholder="Search title" />
      </Card>
    }
  />
);
