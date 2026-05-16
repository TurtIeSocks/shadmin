import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";

export default {
  title: "Page components/Edit",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    { id: 1, title: "Hello world", body: "Lorem ipsum" },
    { id: 2, title: "Another post", body: "Dolor sit amet" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const PostEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </Edit>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        edit={PostEdit}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

const PostEditCustomTitle = () => (
  <Edit title="Editing post">
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Edit>
);

export const CustomTitle = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditCustomTitle} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditNoActions = () => (
  <Edit actions={false}>
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Edit>
);

export const NoActions = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditNoActions} />
    </Admin>
  </TestMemoryRouter>
);
