import React from "react";
import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import {
  Admin,
  DataTable,
  List,
  ListActions,
  ListToolbar,
  ShowGuesser,
  TextInput,
} from "@/components/admin";
import fakeRestDataProvider from "ra-data-fakerest";

export default {
  title: "UI & Layout/ListToolbar",
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author: "Leo Tolstoy" },
    { id: 2, title: "Lorem ipsum", author: "Jane Austen" },
    { id: 3, title: "First post", author: "Oscar Wilde" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({ filters }: { filters?: React.ReactElement[] }) => (
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
          <List
            filters={filters}
            actions={
              <ListToolbar filters={filters} actions={<ListActions />} />
            }
          >
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
            </DataTable>
          </List>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper
    filters={[<TextInput key="q" source="q" label="Search" alwaysOn />]}
  />
);

export const NoFilters = () => <Wrapper />;
