import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { Search, Type } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import { Admin, DataTable, FilterList, FilterListItem, FilterListSection, List, ListPagination, ShowGuesser, TextInput } from "@/components/admin";
import { FilterLiveForm } from "@/components/extras";
import { Card } from "@/components/ui/card";

export default {
  title: "Data Display/FilterListSection",
};

const data = {
  books: [
    { id: 1, title: "War and Peace", category: "novel" },
    { id: 2, title: "Pride and Prejudice", category: "novel" },
    { id: 3, title: "The Picture of Dorian Gray", category: "tale" },
    { id: 4, title: "Le Petit Prince", category: "tale" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const FilterSidebar = () => (
  <Card className="p-4 w-60 self-start space-y-4">
    <FilterListSection label="Title" icon={<Type className="size-4" />}>
      <FilterLiveForm>
        <TextInput
          source="title"
          label={false}
          helperText={false}
          placeholder="Filter by title"
        />
      </FilterLiveForm>
    </FilterListSection>
    <FilterList label="Category" icon={<Search className="size-4" />}>
      <FilterListItem label="Novel" value={{ category: "novel" }} />
      <FilterListItem label="Tale" value={{ category: "tale" }} />
    </FilterList>
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
                  <DataTable.Col source="category" />
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
