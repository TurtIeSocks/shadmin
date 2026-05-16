import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { ShowGuesser } from "@/components/admin/show-guesser";

export default {
  title: "Page components/List",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: Array.from({ length: 23 }).map((_, i) => ({
    id: i + 1,
    title: `Post #${i + 1}`,
    views: (i + 1) * 17,
  })),
};

const dataProvider = fakeRestProvider(data, false);

const PostList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="views" />
    </DataTable>
  </List>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostList} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const PostListCustomPerPage = () => (
  <List perPage={5}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const CustomPerPage = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListCustomPerPage} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const PostListCustomSort = () => (
  <List sort={{ field: "views", order: "DESC" }}>
    <DataTable>
      <DataTable.Col source="title" />
      <DataTable.Col source="views" />
    </DataTable>
  </List>
);

export const CustomSort = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListCustomSort} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);
