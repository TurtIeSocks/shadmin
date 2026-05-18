import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Show } from "@/components/admin/show";
import { SimpleShowLayout } from "@/components/admin/simple-show-layout";
import { RecordField } from "@/components/admin/record-field";
import { ListGuesser } from "@/components/admin/list-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";

export default {
  title: "Page components/Show",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    { id: 1, title: "Hello world", body: "Lorem ipsum dolor sit amet" },
    { id: 2, title: "Another post", body: "Consectetur adipiscing elit" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const PostShow = () => (
  <Show>
    <SimpleShowLayout>
      <RecordField source="id" />
      <RecordField source="title" />
      <RecordField source="body" />
    </SimpleShowLayout>
  </Show>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        show={PostShow}
        edit={EditGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

const PostShowCustomTitle = () => (
  <Show title="Post details">
    <SimpleShowLayout>
      <RecordField source="title" />
    </SimpleShowLayout>
  </Show>
);

export const CustomTitle = () => (
  <TestMemoryRouter initialEntries={["/posts/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={PostShowCustomTitle} />
    </Admin>
  </TestMemoryRouter>
);

const PostShowNoActions = () => (
  <Show actions={false}>
    <SimpleShowLayout>
      <RecordField source="title" />
      <RecordField source="body" />
    </SimpleShowLayout>
  </Show>
);

const ShowNotes = () => (
  <div className="p-4 bg-muted rounded text-sm">
    <p className="font-medium mb-2">Related actions</p>
    <p>Use the Edit button in the toolbar to modify this record.</p>
  </div>
);

const PostShowWithAside = () => (
  <Show aside={<ShowNotes />}>
    <SimpleShowLayout>
      <RecordField source="id" />
      <RecordField source="title" />
      <RecordField source="body" />
    </SimpleShowLayout>
  </Show>
);

export const WithAside = () => (
  <TestMemoryRouter initialEntries={["/posts/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={PostShowWithAside} />
    </Admin>
  </TestMemoryRouter>
);

export const NoActions = () => (
  <TestMemoryRouter initialEntries={["/posts/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={PostShowNoActions} />
    </Admin>
  </TestMemoryRouter>
);
