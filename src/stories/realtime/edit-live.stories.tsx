import { Resource } from "ra-core";
import { TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import { Admin, SimpleForm, TextInput } from "@/components/admin";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";
import { EditLive } from "@/components/realtime/edit-live";

const seed = { posts: [{ id: 1, title: "alpha" }] };
export const editTransport = fakeTransport();
export const editDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  editTransport
);

export default { title: "realtime/EditLive" };

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/1"]}>
    <Admin dataProvider={editDataProvider}>
      <Resource
        name="posts"
        edit={() => (
          <EditLive>
            <SimpleForm>
              <TextInput source="title" />
            </SimpleForm>
          </EditLive>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
