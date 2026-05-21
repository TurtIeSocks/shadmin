import { Resource } from "ra-core";
import { TestMemoryRouter } from "ra-core";
import { Admin, SimpleForm, TextInput } from "@/components/admin";
import { EditLive } from "@/components/realtime/edit-live";
import { editDataProvider } from "./edit-live-fixtures";

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
