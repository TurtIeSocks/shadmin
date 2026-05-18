import { TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Layout } from "@/components/admin/layout";
import { Resource } from "@/components/admin/resource";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";

export default {
  title: "UI & Layout/AppSidebar",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  posts: [{ id: 1, title: "Hello world" }],
  comments: [{ id: 1, body: "First comment" }],
  authors: [{ id: 1, name: "John Doe" }],
};

const dataProvider = fakeRestProvider(data, false);

// AppSidebar is rendered automatically as part of the default Layout when used
// inside an Admin. These stories show the sidebar in real context — collapsed
// or expanded — across single and multi-resource setups.
export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const MultipleResources = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
      <Resource name="comments" list={ListGuesser} show={ShowGuesser} />
      <Resource name="authors" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithClosedSize = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      layout={(props) => (
        <Layout
          {...props}
          sidebar={(sidebarProps) => (
            <AppSidebar {...sidebarProps} closedSize={72} />
          )}
        />
      )}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithAppBarAlwaysOn = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      layout={(props) => (
        <Layout
          {...props}
          sidebar={(sidebarProps) => (
            <AppSidebar {...sidebarProps} appBarAlwaysOn />
          )}
        />
      )}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithGroups = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="posts"
        list={ListGuesser}
        show={ShowGuesser}
        group="Content"
      />
      <Resource
        name="comments"
        list={ListGuesser}
        show={ShowGuesser}
        group="Content"
      />
      <Resource
        name="authors"
        list={ListGuesser}
        show={ShowGuesser}
        group="People"
      />
    </Admin>
  </TestMemoryRouter>
);
