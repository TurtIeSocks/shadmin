import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { Clock } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  FilterList,
  FilterListItem,
  List,
  ListPagination,
  ShowGuesser,
} from "@/components/admin";
import { Card } from "@/components/ui/card";

export default {
  title: "Data Display/FilterListItem",
};

const data = {
  posts: [
    { id: 1, title: "Hello world", category: "novel" },
    { id: 2, title: "Lorem ipsum", category: "novel" },
    { id: 3, title: "First post", category: "tale" },
    { id: 4, title: "Another post", category: "tale" },
    { id: 5, title: "Sample article", category: "novel" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const FilterSidebar = () => (
  <Card className="p-4 w-60 self-start">
    <FilterList label="Category" icon={<Clock className="size-4" />}>
      <FilterListItem label="Novel" value={{ category: "novel" }} />
      <FilterListItem label="Tale" value={{ category: "tale" }} />
    </FilterList>
  </Card>
);

const Wrapper = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="posts"
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
