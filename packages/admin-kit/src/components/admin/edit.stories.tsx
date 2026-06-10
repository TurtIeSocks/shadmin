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

const EditNotes = () => (
  <div className="p-4 bg-muted rounded text-sm">
    <p className="font-medium mb-2">Editing tips</p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Changes are undoable for 5 seconds.</li>
      <li>Delete removes the record permanently.</li>
    </ul>
  </div>
);

const PostEditWithAside = () => (
  <Edit aside={<EditNotes />}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </Edit>
);

export const WithAside = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditWithAside} />
    </Admin>
  </TestMemoryRouter>
);

export const NoActions = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditNoActions} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditWithOffline = () => (
  <Edit
    offline={
      <p className="text-muted-foreground p-4">
        You appear to be offline. Reconnect to continue editing.
      </p>
    }
  >
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Edit>
);

export const WithOffline = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditWithOffline} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditWithError = () => (
  <Edit
    error={
      <p className="text-destructive p-4">
        Failed to load post. Please try again.
      </p>
    }
  >
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Edit>
);

export const WithError = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditWithError} />
    </Admin>
  </TestMemoryRouter>
);

const PostEditWithRender = () => (
  <Edit
    render={({ record, saving }) => (
      <div className="p-4 max-w-sm flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Editing: {record?.title ?? "…"} — saving: {String(saving)}
        </p>
        <TextInput source="title" />
      </div>
    )}
  />
);

export const WithRender = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} edit={PostEditWithRender} />
    </Admin>
  </TestMemoryRouter>
);
