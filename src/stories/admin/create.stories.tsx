import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { ListGuesser } from "@/components/admin/list-guesser";

export default {
  title: "Page components/Create",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const dataProvider = fakeRestProvider({ posts: [] }, false);

const PostCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </Create>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} create={PostCreate} />
    </Admin>
  </TestMemoryRouter>
);

const PostCreateCustomTitle = () => (
  <Create title="New blog post">
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Create>
);

export const CustomTitle = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        create={PostCreateCustomTitle}
      />
    </Admin>
  </TestMemoryRouter>
);

const PostCreateNoBreadcrumb = () => (
  <Create disableBreadcrumb>
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Create>
);

export const NoBreadcrumb = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        create={PostCreateNoBreadcrumb}
      />
    </Admin>
  </TestMemoryRouter>
);
