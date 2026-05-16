import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { TextInput } from "@/components/admin/text-input";
import {
  AddSavedQueryIconButton,
  RemoveSavedQueryIconButton,
} from "@/components/admin/saved-queries";

export default {
  title: "Data Edition/SavedQueries",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    { id: 1, title: "Hello", status: "published" },
    { id: 2, title: "Draft post", status: "draft" },
    { id: 3, title: "Another", status: "published" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const postFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <TextInput key="status" source="status" label="Status" />,
];

const SavedQueriesActions = () => (
  <div className="flex flex-row items-center gap-1">
    <AddSavedQueryIconButton />
    <RemoveSavedQueryIconButton />
  </div>
);

const PostList = () => (
  <List filters={postFilters} actions={<SavedQueriesActions />}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="status" />
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

const AddOnly = () => (
  <List filters={postFilters} actions={<AddSavedQueryIconButton />}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);

export const AddButtonOnly = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={AddOnly} />
    </Admin>
  </TestMemoryRouter>
);
