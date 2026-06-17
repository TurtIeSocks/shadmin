import { TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Resource } from "@/components/admin/resource";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";
import { ShowGuesser } from "@/components/admin/guessers/show-guesser";
import { EditGuesser } from "@/components/admin/guessers/edit-guesser";

export default {
  title: "Application configuration/Resource",
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
  comments: [
    { id: 1, post_id: 1, body: "Nice post!" },
    { id: 2, post_id: 1, body: "Thanks for sharing" },
  ],
};

const dataProvider = fakeRestProvider(data, false);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithCrudViews = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const MultipleResources = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
      <Resource name="comments" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithSidebarGroup = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} group="Content" />
      <Resource name="comments" list={ListGuesser} group="Content" />
    </Admin>
  </TestMemoryRouter>
);
