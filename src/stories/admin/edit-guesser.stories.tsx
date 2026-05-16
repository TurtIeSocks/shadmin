import { Resource, TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { EditGuesser } from "@/components/admin/edit-guesser";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";

export default {
  title: "Supabase/EditGuesser",
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
    },
    {
      id: 2,
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
      has_ordered: false,
    },
  ],
};

const dataProvider = fakeRestProvider(data, false);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/customers/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="customers"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithoutLog = () => (
  <TestMemoryRouter initialEntries={["/customers/1"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="customers"
        list={ListGuesser}
        edit={<EditGuesser enableLog={false} />}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);
