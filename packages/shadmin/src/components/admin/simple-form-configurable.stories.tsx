import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Edit } from "@/components/admin/edit";
import { SimpleFormConfigurable } from "@/components/admin/simple-form-configurable";
import { TextInput } from "@/components/admin/text-input";
import { ListGuesser } from "@/components/admin/list-guesser";
import { InspectorButton } from "@/components/admin/inspector-button";

export default {
  title: "Data Edition/SimpleFormConfigurable",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [
    {
      id: 1,
      title: "Hello world",
      author: "Jane Doe",
      body: "Lorem ipsum dolor sit amet",
    },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const PostEdit = () => (
  <Edit actions={<InspectorButton />}>
    <SimpleFormConfigurable>
      <TextInput source="id" />
      <TextInput source="title" />
      <TextInput source="author" />
      <TextInput source="body" multiline />
    </SimpleFormConfigurable>
  </Edit>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEdit} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditOmit = () => (
  <Edit actions={<InspectorButton />}>
    <SimpleFormConfigurable omit={["id"]}>
      <TextInput source="id" />
      <TextInput source="title" />
      <TextInput source="author" />
      <TextInput source="body" multiline />
    </SimpleFormConfigurable>
  </Edit>
);

export const WithOmit = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditOmit} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditCustomKey = () => (
  <Edit actions={<InspectorButton />}>
    <SimpleFormConfigurable preferenceKey="posts.edit-form">
      <TextInput source="title" />
      <TextInput source="author" />
      <TextInput source="body" multiline />
    </SimpleFormConfigurable>
  </Edit>
);

export const CustomPreferenceKey = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditCustomKey} />
    </Admin>
  </TestMemoryRouter>
);
