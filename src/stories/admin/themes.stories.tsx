import { memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  Admin,
  bwTheme,
  DataTable,
  defaultTheme,
  EditButton,
  houseTheme,
  List,
  nanoTheme,
  radiantTheme,
  ShowGuesser,
  type AdminTheme,
} from "@/components/admin";
import { i18nProvider } from "@/lib/i18n-provider";

export default {
  title: "Application configuration/Themes",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const data = {
  books: [
    {
      id: 1,
      title: "Application configuration/Themes",
      author: "Leo Tolstoy",
      year: 1869,
    },
    {
      id: 2,
      title: "Application configuration/Themes",
      author: "Jane Austen",
      year: 1813,
    },
    {
      id: 3,
      title: "Application configuration/Themes",
      author: "Oscar Wilde",
      year: 1890,
    },
    {
      id: 4,
      title: "Application configuration/Themes",
      author: "Antoine de Saint-Exupéry",
      year: 1943,
    },
    {
      id: 5,
      title: "Application configuration/Themes",
      author: "Paulo Coelho",
      year: 1988,
    },
  ],
};

const dataProvider = fakeRestDataProvider(data);

const BookList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="author" />
      <DataTable.Col source="year" />
      <DataTable.Col label="Actions">
        <EditButton />
      </DataTable.Col>
    </DataTable>
  </List>
);

const ThemedSample = ({ theme }: { theme: AdminTheme }) => (
  <TestMemoryRouter>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      theme={theme}
    >
      <Resource name="books" list={BookList} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const Default = () => <ThemedSample theme={defaultTheme} />;

export const BW = () => <ThemedSample theme={bwTheme} />;

export const Nano = () => <ThemedSample theme={nanoTheme} />;

export const Radiant = () => <ThemedSample theme={radiantTheme} />;

export const House = () => <ThemedSample theme={houseTheme} />;
