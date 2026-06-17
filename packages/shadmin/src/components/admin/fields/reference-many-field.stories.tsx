import { Resource, TestMemoryRouter } from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";

import { Admin } from "@/components/admin/admin";
import { Show } from "@/components/admin/views/show";
import { SimpleShowLayout } from "@/components/admin/views/simple-show-layout";
import { RecordField } from "@/components/admin/fields/record-field";
import { ReferenceManyField } from "@/components/admin/fields/reference-many-field";
import { DataTable } from "@/components/admin/list/data-table";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";

export default {
  title: "Data Display/ReferenceManyField",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  authors: [{ id: 1, name: "Jane Doe" }],
  books: [
    { id: 1, title: "Hello", author_id: 1, year: 2020 },
    { id: 2, title: "World", author_id: 1, year: 2021 },
    { id: 3, title: "Foo", author_id: 1, year: 2022 },
  ],
};

const dataProvider = fakeRestProvider(data, false);

const AuthorShow = () => (
  <Show>
    <SimpleShowLayout>
      <RecordField source="name" />
      <RecordField source="books" label="Books">
        <ReferenceManyField reference="books" target="author_id">
          <DataTable hasBulkActions={false}>
            <DataTable.Col source="title" />
            <DataTable.Col source="year" />
          </DataTable>
        </ReferenceManyField>
      </RecordField>
    </SimpleShowLayout>
  </Show>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" show={AuthorShow} list={ListGuesser} />
      <Resource name="books" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const AuthorShowOffline = () => (
  <Show>
    <SimpleShowLayout>
      <RecordField source="name" />
      <RecordField source="books" label="Books">
        <ReferenceManyField
          reference="books"
          target="author_id"
          offline={
            <span className="text-muted-foreground italic">
              Offline — books unavailable
            </span>
          }
        >
          <DataTable hasBulkActions={false}>
            <DataTable.Col source="title" />
            <DataTable.Col source="year" />
          </DataTable>
        </ReferenceManyField>
      </RecordField>
    </SimpleShowLayout>
  </Show>
);

export const WithOfflineState = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" show={AuthorShowOffline} list={ListGuesser} />
      <Resource name="books" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const AuthorShowSorted = () => (
  <Show>
    <SimpleShowLayout>
      <RecordField source="name" />
      <RecordField label="Books (most recent first)">
        <ReferenceManyField
          reference="books"
          target="author_id"
          sort={{ field: "year", order: "DESC" }}
        >
          <DataTable hasBulkActions={false}>
            <DataTable.Col source="title" />
            <DataTable.Col source="year" />
          </DataTable>
        </ReferenceManyField>
      </RecordField>
    </SimpleShowLayout>
  </Show>
);

export const WithSort = () => (
  <TestMemoryRouter initialEntries={["/authors/1/show"]}>
    <Admin dataProvider={dataProvider}>
      <Resource name="authors" show={AuthorShowSorted} list={ListGuesser} />
      <Resource name="books" list={ListGuesser} />
    </Admin>
  </TestMemoryRouter>
);
