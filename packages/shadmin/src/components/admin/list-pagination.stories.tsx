import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { DataTable } from "@/components/admin/data-table";

export default {
  title: "Data Display/ListPagination",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: Array.from({ length: 87 }).map((_, i) => ({
    id: i + 1,
    title: `Post #${i + 1}`,
  })),
};

const dataProvider = fakeRestProvider(data, false);

const PostList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostList} />
    </Admin>
  </TestMemoryRouter>
);

const CustomPagination = () => <ListPagination rowsPerPageOptions={[5, 10]} />;

const PostListCustomRows = () => (
  <List pagination={<CustomPagination />} perPage={5}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const CustomRowsPerPage = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListCustomRows} />
    </Admin>
  </TestMemoryRouter>
);

const PostListFewItems = () => (
  <List perPage={50}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const FewItems = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListFewItems} />
    </Admin>
  </TestMemoryRouter>
);
