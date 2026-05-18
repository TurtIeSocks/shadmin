import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import type { ReactNode } from "react";
import {
  Admin,
  AdminContext,
  AdminUI,
} from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";
import { bwTheme } from "@/components/admin/bw-theme";

export default {
  title: "Application configuration/Admin",
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

export const Basic = () => (
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

export const NoResources = () => (
  <TestMemoryRouter>
    <Admin dataProvider={dataProvider} />
  </TestMemoryRouter>
);

export const CustomTitle = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider} title="My Custom Admin">
      <Resource name="posts" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithTheme = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin dataProvider={dataProvider} theme={bwTheme}>
      <Resource name="posts" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const BetweenLayer = ({ children }: { children: ReactNode }) => (
  <div data-testid="between-layer">{children}</div>
);

export const Composition = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <AdminContext dataProvider={dataProvider}>
      <BetweenLayer>
        <AdminUI>
          <Resource
            name="posts"
            list={ListGuesser}
            edit={EditGuesser}
            show={ShowGuesser}
          />
        </AdminUI>
      </BetweenLayer>
    </AdminContext>
  </TestMemoryRouter>
);
