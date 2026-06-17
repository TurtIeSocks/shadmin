import fakeRestProvider from "ra-data-fakerest";
import { Resource, TestMemoryRouter } from "shadmin-core";

import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ReferenceOneField } from "@/components/admin/reference-one-field";
import { Show } from "@/components/admin/show";
import { TextField } from "@/components/admin/text-field";
import { RecordField } from "@/components/admin/record-field";
import { SimpleShowLayout } from "@/components/admin/simple-show-layout";

export default {
  title: "Data Display/ReferenceOneField",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const fakeData = {
  authors: [{ id: 1, name: "James Joyce" }],
  bios: [
    {
      id: 7,
      author_id: 1,
      body: "Irish novelist, short story writer, poet, and literary critic.",
    },
  ],
};
const dataProvider = fakeRestProvider(fakeData, true);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="authors"
        list={ListGuesser}
        show={
          <Show>
            <SimpleShowLayout>
              <RecordField source="id" />
              <RecordField source="name" />
              <RecordField label="Biography">
                <ReferenceOneField reference="bios" target="author_id">
                  <TextField source="body" />
                </ReferenceOneField>
              </RecordField>
            </SimpleShowLayout>
          </Show>
        }
      />
      <Resource name="bios" />
    </Admin>
  </TestMemoryRouter>
);

export const WithOfflineState = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="authors"
        list={ListGuesser}
        show={
          <Show>
            <SimpleShowLayout>
              <RecordField source="id" />
              <RecordField source="name" />
              <RecordField label="Biography">
                <ReferenceOneField
                  reference="bios"
                  target="author_id"
                  offline={
                    <span className="text-muted-foreground italic">
                      Offline — biography unavailable
                    </span>
                  }
                >
                  <TextField source="body" />
                </ReferenceOneField>
              </RecordField>
            </SimpleShowLayout>
          </Show>
        }
      />
      <Resource name="bios" />
    </Admin>
  </TestMemoryRouter>
);

export const WithRenderProp = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource
        name="authors"
        list={ListGuesser}
        show={
          <Show>
            <SimpleShowLayout>
              <RecordField source="name" />
              <RecordField label="Biography">
                <ReferenceOneField
                  reference="bios"
                  target="author_id"
                  render={({ referenceRecord }) =>
                    referenceRecord ? (
                      <em>{String(referenceRecord.body)}</em>
                    ) : null
                  }
                />
              </RecordField>
            </SimpleShowLayout>
          </Show>
        }
      />
      <Resource name="bios" />
    </Admin>
  </TestMemoryRouter>
);
