import { Resource } from "shadmin-core";
import { TestMemoryRouter } from "shadmin-core";
import { Admin } from "@/components/admin";
import { SimpleShowLayout } from "@/components/admin/views/simple-show-layout";
import { RecordField } from "@/components/admin/fields/record-field";
import { ShowLive } from "@/components/realtime/show-live";
import { showDataProvider } from "./__fixtures__/show-live-fixtures";

export default { title: "realtime/ShowLive" };

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts/1/show"]}>
    <Admin dataProvider={showDataProvider}>
      <Resource
        name="posts"
        show={() => (
          <ShowLive>
            <SimpleShowLayout>
              <RecordField source="title" />
            </SimpleShowLayout>
          </ShowLive>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
