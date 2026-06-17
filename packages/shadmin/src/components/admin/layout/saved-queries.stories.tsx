import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { List } from "@/components/admin/list/list";
import { DataTable } from "@/components/admin/list/data-table";
import { TextInput } from "@/components/admin/inputs/text-input";
import { Star } from "lucide-react";

import {
  AddSavedQueryIconButton,
  RemoveSavedQueryIconButton,
  SavedQueriesList,
} from "@/components/admin/layout/saved-queries";

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

const WithStarIcon = () => (
  <List filters={postFilters}>
    <div className="flex gap-4">
      <div className="w-48 p-3 border rounded">
        <SavedQueriesList icon={<Star className="size-4" />} />
      </div>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="title" />
        <DataTable.Col source="status" />
      </DataTable>
    </div>
  </List>
);

export const WithCustomIcon = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={WithStarIcon} />
    </Admin>
  </TestMemoryRouter>
);
