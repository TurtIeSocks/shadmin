import { Resource } from "ra-core";
import { TestMemoryRouter } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import { Admin } from "@/components/admin";
import { SimpleShowLayout } from "@/components/admin/simple-show-layout";
import { RecordField } from "@/components/admin/record-field";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";
import { ShowLive } from "@/components/realtime/show-live";

const seed = { posts: [{ id: 1, title: "alpha" }] };
export const showTransport = fakeTransport();
export const showDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  showTransport
);

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
