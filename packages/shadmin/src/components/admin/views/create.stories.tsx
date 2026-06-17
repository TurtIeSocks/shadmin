import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Create } from "@/components/admin/views/create";
import { SimpleForm } from "@/components/admin/form/simple-form";
import { TextInput } from "@/components/admin/inputs/text-input";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";

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

const PostCreateWithRender = () => (
  <Create
    render={({ saving }) => (
      <div className="p-4 max-w-sm flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Custom render prop — saving: {String(saving)}
        </p>
        <TextInput source="title" />
      </div>
    )}
  />
);

export const WithRender = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} create={PostCreateWithRender} />
    </Admin>
  </TestMemoryRouter>
);

const PostCreateAside = () => (
  <div className="p-4 bg-muted rounded text-sm">
    <p className="font-medium mb-2">Tips</p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Keep the title concise</li>
      <li>Add a descriptive body</li>
    </ul>
  </div>
);

const PostCreateWithAside = () => (
  <Create aside={<PostCreateAside />}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </Create>
);

export const WithAside = () => (
  <TestMemoryRouter initialEntries={["/posts/create"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} create={PostCreateWithAside} />
    </Admin>
  </TestMemoryRouter>
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
