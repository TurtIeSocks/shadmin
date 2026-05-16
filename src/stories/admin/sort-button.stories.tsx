import React from "react";
import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  DataTable,
  List,
  ShowGuesser,
  SortButton,
} from "@/components/admin";
import fakeRestDataProvider from "ra-data-fakerest";

export default {
  title: "Data Display/SortButton",
};

const data = {
  books: [
    {
      id: 1,
      title: "Data Display/SortButton",
      author: { name: "Leo Tolstoy" },
      year: 1869,
    },
    {
      id: 2,
      title: "Data Display/SortButton",
      author: { name: "Jane Austen" },
      year: 1813,
    },
    {
      id: 3,
      title: "Data Display/SortButton",
      author: { name: "Oscar Wilde" },
      year: 1890,
    },
    {
      id: 4,
      title: "Data Display/SortButton",
      author: { name: "Antoine de Saint-Exupéry" },
      year: 1943,
    },
    {
      id: 5,
      title: "Data Display/SortButton",
      author: { name: "Paulo Coelho" },
      year: 1988,
    },
    {
      id: 6,
      title: "Data Display/SortButton",
      author: { name: "Gustave Flaubert" },
      year: 1857,
    },
    {
      id: 7,
      title: "Data Display/SortButton",
      author: { name: "J. R. R. Tolkien" },
      year: 1954,
    },
  ],
};

const dataProvider = fakeRestDataProvider(data);

const Wrapper = ({
  defaultDataProvider = dataProvider,
  defaultI18nProvider = i18nProvider,
  actions = false,
}: {
  defaultDataProvider?: DataProvider;
  defaultI18nProvider?: ReturnType<typeof polyglotI18nProvider>;
  actions?: React.ReactElement | false;
}) => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={defaultDataProvider}
      i18nProvider={defaultI18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={
          <List
            perPage={5}
            actions={actions}
            sort={{ field: "id", order: "ASC" }}
          >
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col label="Author" source="author.name" />
              <DataTable.Col source="year" />
            </DataTable>
          </List>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper actions={<SortButton fields={["id", "title", "year"]} />} />
);

export const CustomLabel = () => (
  <Wrapper
    actions={
      <SortButton
        fields={["id", "title", "year"]}
        label="myapp.action.sort_by"
      />
    }
    defaultI18nProvider={polyglotI18nProvider(
      () => ({
        ...defaultMessages,
        myapp: {
          action: {
            sort_by: "Ordered by %{field_lower_first} (%{order})",
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  />
);

export const ResourceSpecificLabel = () => (
  <Wrapper
    actions={<SortButton fields={["id", "title", "year"]} />}
    defaultI18nProvider={polyglotI18nProvider(
      () => ({
        ...defaultMessages,
        resources: {
          books: {
            action: {
              sort_by: "Sorted by %{field_lower_first} (%{order})",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  />
);
