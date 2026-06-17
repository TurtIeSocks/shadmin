import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { ShowGuesser } from "@/components/admin/show-guesser";
import { ListGuesser } from "@/components/admin/list-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";

export default {
  title: "Supabase/ShowGuesser",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  customers: [
    {
      id: 1,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      has_ordered: true,
      created_at: "2024-01-15",
    },
    {
      id: 2,
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
      has_ordered: false,
      created_at: "2024-02-20",
    },
  ],
};

const dataProvider = fakeRestProvider(data, false);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/customers/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="customers"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithoutLog = () => (
  <TestMemoryRouter initialEntries={["/customers/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="customers"
        list={ListGuesser}
        show={<ShowGuesser enableLog={false} />}
      />
    </Admin>
  </TestMemoryRouter>
);
