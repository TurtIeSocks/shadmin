import fakeRestProvider from "ra-data-fakerest";
import { Resource, TestMemoryRouter } from "shadmin-core";

import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";
import { EditGuesser } from "@/components/admin/guessers/edit-guesser";
import { ReferenceArrayField } from "@/components/admin/fields/reference-array-field";
import { Show } from "@/components/admin/views/show";
import { ShowGuesser } from "@/components/admin/guessers/show-guesser";
import { DataTable } from "@/components/admin/list/data-table";
import { RecordField } from "@/components/admin/fields/record-field";
import { SimpleShowLayout } from "@/components/admin/views/simple-show-layout";

export default {
  title: "Data Display/ReferenceArrayField",
  parameters: {
    docs: {
      // 👇 Enable Code panel for all stories in this file
      codePanel: true,
    },
  },
};

const fakeData = {
  bands: [{ id: 1, name: "The Beatles", artists_ids: [1, 2, 3, 4] }],
  artists: [
    { id: 1, name: "John Lennon" },
    { id: 2, name: "Paul McCartney" },
    { id: 3, name: "Ringo Star" },
    { id: 4, name: "George Harrison" },
    { id: 5, name: "Mick Jagger" },
    { id: 6, name: "Keith Richards" },
    { id: 7, name: "Ronnie Wood" },
    { id: 8, name: "Charlie Watts" },
  ],
};
const dataProvider = fakeRestProvider(fakeData, true);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/bands/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="bands"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
      />
      <Resource name="artists" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithOfflineState = () => (
  <TestMemoryRouter initialEntries={["/bands/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="bands"
        list={ListGuesser}
        show={
          <Show>
            <SimpleShowLayout>
              <RecordField source="id" />
              <RecordField source="name" />
              <RecordField source="artists_ids" label="Artists">
                <ReferenceArrayField
                  reference="artists"
                  source="artists_ids"
                  offline={
                    <span className="text-muted-foreground italic">
                      Offline — artists unavailable
                    </span>
                  }
                />
              </RecordField>
            </SimpleShowLayout>
          </Show>
        }
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithDataTable = () => (
  <TestMemoryRouter initialEntries={["/bands/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="bands"
        list={ListGuesser}
        show={
          <Show>
            <SimpleShowLayout>
              <RecordField source="id" />
              <RecordField source="name" />
              <RecordField source="artists_ids">
                <ReferenceArrayField reference="artists" source="artists_ids">
                  <DataTable hasBulkActions={false}>
                    <DataTable.Col source="id" />
                    <DataTable.Col source="name" />
                  </DataTable>
                </ReferenceArrayField>
              </RecordField>
            </SimpleShowLayout>
          </Show>
        }
      />
    </Admin>
  </TestMemoryRouter>
);
