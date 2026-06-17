import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { Mail, Newspaper } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  ListPagination,
  ShowGuesser,
} from "@/components/admin";
import { Card } from "@/components/ui/card";

export default {
  title: "Data Display/FilterList",
};

const data = {
  posts: [
    {
      id: 1,
      title: "Hello world",
      published: true,
      has_newsletter: true,
    },
    {
      id: 2,
      title: "Lorem ipsum",
      published: true,
      has_newsletter: false,
    },
    {
      id: 3,
      title: "First post",
      published: false,
      has_newsletter: false,
    },
    {
      id: 4,
      title: "Another post",
      published: false,
      has_newsletter: true,
    },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const FilterSidebar = () => (
  <Card className="p-4 w-60 self-start">
    <FilterLiveSearch />
    <FilterList label="Status" icon={<Newspaper className="size-4" />}>
      <FilterListItem label="Published" value={{ published: true }} />
      <FilterListItem label="Draft" value={{ published: false }} />
    </FilterList>
    <FilterList label="Newsletter" icon={<Mail className="size-4" />}>
      <FilterListItem label="Subscribed" value={{ has_newsletter: true }} />
      <FilterListItem
        label="Not subscribed"
        value={{ has_newsletter: false }}
      />
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
                  <DataTable.Col source="published" />
                  <DataTable.Col source="has_newsletter" />
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
