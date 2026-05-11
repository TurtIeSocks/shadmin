import React from "react";
import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import {
  Admin,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  ListActions,
  ShowGuesser,
  TextInput,
} from "@/components/admin";
import fakeRestDataProvider from "ra-data-fakerest";

export default {
  title: "Lists/ListActions",
};

const data = {
  posts: [
    { id: 1, title: "War and Peace", author: "Leo Tolstoy" },
    { id: 2, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 3, title: "The Picture of Dorian Gray", author: "Oscar Wilde" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({
  actions,
  filters,
}: {
  actions?: React.ReactElement;
  filters?: React.ReactElement[];
}) => (
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
          <List actions={actions ?? <ListActions />} filters={filters}>
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

export const Basic = () => <Wrapper />;

export const WithFilters = () => (
  <Wrapper filters={[<TextInput key="q" source="q" label="Search" alwaysOn />]} />
);

export const CustomChildren = () => (
  <Wrapper
    actions={
      <ListActions>
        <CreateButton />
        <ExportButton />
      </ListActions>
    }
  />
);
