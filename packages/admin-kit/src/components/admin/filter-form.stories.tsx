import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { TextInput } from "@/components/admin/text-input";
import { ListGuesser } from "@/components/admin/list-guesser";

export default {
  title: "Data Edition/FilterForm",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author: "Jane Doe" },
    { id: 2, title: "Another post", author: "John Smith" },
    { id: 3, title: "Yet another", author: "Jane Doe" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

// FilterForm is rendered automatically by the List component when filters are
// passed. The Basic story shows the always-on filter pattern; AlwaysOn shows
// a filter that cannot be removed from the form.
const postFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <TextInput key="author" source="author" label="Author" />,
];

const PostList = () => (
  <List filters={postFilters}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="author" />
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

const noAlwaysOnFilters = [
  <TextInput key="q" source="q" label="Search" />,
  <TextInput key="author" source="author" label="Author" />,
];

const PostListNoAlwaysOn = () => (
  <List filters={noAlwaysOnFilters}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const NoAlwaysOnFilters = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListNoAlwaysOn} />
    </Admin>
  </TestMemoryRouter>
);

export const NoFilters = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);
