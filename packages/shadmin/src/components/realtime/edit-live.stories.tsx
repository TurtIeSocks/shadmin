import { Resource } from "shadmin-core";
import { TestMemoryRouter } from "shadmin-core";
import { Admin, SimpleForm, TextInput } from "@/components/admin";
import { EditLive } from "@/components/realtime/edit-live";
import { editDataProvider } from "./__fixtures__/edit-live-fixtures";

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
