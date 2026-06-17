import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { ReferenceField } from "@/components/admin/fields/reference-field";
import { ShowGuesser } from "@/components/admin/guessers/show-guesser";
import { EditGuesser } from "@/components/admin/guessers/edit-guesser";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";
import { List } from "@/components/admin/list/list";
import { DataTable } from "@/components/admin/list/data-table";

export default {
  title: "Data Display/ReferenceField",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author_id: 1 },
    { id: 2, title: "Another post", author_id: 2 },
  ],
  authors: [
    { id: 1, name: "Jane Doe" },
    { id: 2, name: "John Smith" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const PostList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="author_id" label="Author">
        <ReferenceField source="author_id" reference="authors" />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={PostList}
        edit={EditGuesser}
        show={ShowGuesser}
      />
      <Resource name="authors" list={ListGuesser} recordRepresentation="name" />
    </Admin>
  </TestMemoryRouter>
);

const PostListOffline = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="author_id" label="Author">
        <ReferenceField
          source="author_id"
          reference="authors"
          offline={
            <span className="text-muted-foreground italic">Offline</span>
          }
        />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const WithOfflineState = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={PostListOffline}
        edit={EditGuesser}
        show={ShowGuesser}
      />
      <Resource name="authors" list={ListGuesser} recordRepresentation="name" />
    </Admin>
  </TestMemoryRouter>
);

const PostListWithLink = () => (
  <List>
    <DataTable>
      <DataTable.Col source="title" />
      <DataTable.Col source="author_id" label="Author (linked)">
        <ReferenceField source="author_id" reference="authors" link="show" />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const WithLink = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostListWithLink} show={ShowGuesser} />
      <Resource
        name="authors"
        list={ListGuesser}
        show={ShowGuesser}
        recordRepresentation="name"
      />
    </Admin>
  </TestMemoryRouter>
);
