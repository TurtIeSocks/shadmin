import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { ReferenceManyCount } from "@/components/admin/reference-many-count";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";

export default {
  title: "Data Display/ReferenceManyCount",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  authors: [
    { id: 1, name: "Jane Doe" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Alice Johnson" },
  ],
  books: [
    { id: 1, title: "Hello", author_id: 1 },
    { id: 2, title: "World", author_id: 1 },
    { id: 3, title: "Foo", author_id: 1 },
    { id: 4, title: "Bar", author_id: 2 },
    { id: 5, title: "Baz", author_id: 2 },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const AuthorList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Number of books">
        <ReferenceManyCount reference="books" target="author_id" />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/authors"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" list={AuthorList} show={ShowGuesser} />
      <Resource name="books" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const AuthorListWithLink = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Books (linked)">
        <ReferenceManyCount reference="books" target="author_id" link />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const WithLink = () => (
  <TestMemoryRouter initialEntries={["/authors"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" list={AuthorListWithLink} />
      <Resource name="books" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);
