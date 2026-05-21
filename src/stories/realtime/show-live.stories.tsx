import { Resource } from "ra-core";
import { TestMemoryRouter } from "ra-core";
import { Admin } from "@/components/admin";
import { SimpleShowLayout } from "@/components/admin/simple-show-layout";
import { RecordField } from "@/components/admin/record-field";
import { ShowLive } from "@/components/realtime/show-live";
import { showDataProvider } from "./show-live-fixtures";

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
