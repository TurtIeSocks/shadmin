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
  List,
  ListPagination,
  ShowGuesser,
  TextInput,
} from "@/components/admin";
import { FilterLiveForm } from "@/components/extras";
import { Card } from "@/components/ui/card";

export default {
  title: "Data Display/FilterLiveForm",
};

const data = {
  books: [
    { id: 1, title: "War and Peace", author: "Leo Tolstoy" },
    { id: 2, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 3, title: "The Picture of Dorian Gray", author: "Oscar Wilde" },
    { id: 4, title: "Le Petit Prince", author: "Gustave Flaubert" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const FilterSidebar = () => (
  <Card className="p-4 w-60 self-start space-y-2">
    <FilterLiveForm>
      <TextInput
        source="title"
        label="Title"
        helperText={false}
        placeholder="War and Peace"
      />
      <TextInput
        source="author"
        label="Author"
        helperText={false}
        placeholder="Leo Tolstoy"
      />
    </FilterLiveForm>
  </Card>
);

const Wrapper = () => (
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
              <FilterSidebar />
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
