import { Resource, TestMemoryRouter, required } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Create } from "@/components/admin/create";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ListGuesser } from "@/components/admin/list-guesser";

export default {
  title: "Data Edition/ReferenceInput",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [{ id: 1, title: "Hello world", author_id: 1 }],
  authors: [
    { id: 1, name: "Jane Doe" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Alice Johnson" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const PostCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <ReferenceInput source="author_id" reference="authors" />
    </SimpleForm>
  </Create>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" recordRepresentation="name" />
      <Resource name="posts" list={ListGuesser} create={PostCreate} />
    </Admin>
  </TestMemoryRouter>
);

const PostEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <ReferenceInput source="author_id" reference="authors" />
    </SimpleForm>
  </Edit>
);

export const InEdit = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" recordRepresentation="name" />
      <Resource name="posts" list={ListGuesser} edit={PostEdit} />
    </Admin>
  </TestMemoryRouter>
);

const PostCreateOffline = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <ReferenceInput
        source="author_id"
        reference="authors"
        offline={
          <span className="text-muted-foreground italic">
            Offline — authors unavailable
          </span>
        }
      />
    </SimpleForm>
  </Create>
);

export const WithOfflineState = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" recordRepresentation="name" />
      <Resource name="posts" list={ListGuesser} create={PostCreateOffline} />
    </Admin>
  </TestMemoryRouter>
);

const PostCreateRequired = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <ReferenceInput source="author_id" reference="authors">
        <AutocompleteInput validate={required()} />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const WithValidation = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" recordRepresentation="name" />
      <Resource name="posts" list={ListGuesser} create={PostCreateRequired} />
    </Admin>
  </TestMemoryRouter>
);
