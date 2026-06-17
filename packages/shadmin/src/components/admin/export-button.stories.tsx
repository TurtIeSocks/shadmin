import React from "react";
import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { FileSpreadsheet } from "lucide-react";
import {
  Admin,
  ExportButton,
  DataTable,
  List,
  ShowGuesser,
} from "@/components/admin";
import fakeRestDataProvider from "ra-data-fakerest";

export default {
  title: "Data Display/ExportButton",
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author: "Leo Tolstoy" },
    { id: 2, title: "Lorem ipsum", author: "Jane Austen" },
    { id: 3, title: "First post", author: "Oscar Wilde" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({
  i18nProvider,
  actions,
}: {
  i18nProvider?: ReturnType<typeof polyglotI18nProvider>;
  actions?: React.ReactElement;
}) => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={
        i18nProvider ??
        polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })
      }
      store={memoryStore()}
    >
      <Resource
        name="posts"
        list={
          <List actions={actions ?? <ExportButton />}>
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
            </DataTable>
          </List>
        }
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => <Wrapper />;

export const CustomLabel = () => (
  <Wrapper actions={<ExportButton label="Download CSV" />} />
);

export const CustomIcon = () => (
  <Wrapper actions={<ExportButton icon={<FileSpreadsheet />} />} />
);

export const WithRef = () => {
  const ref = React.useRef<HTMLButtonElement>(null);
  return <Wrapper actions={<ExportButton ref={ref} />} />;
};

export const ResourceSpecificLabel = () => (
  <Wrapper
    i18nProvider={polyglotI18nProvider(
      () => ({
        ...defaultMessages,
        resources: {
          posts: {
            action: {
              export: "Download posts",
            },
          },
        },
      }),
      "en",
      undefined,
      { allowMissing: true },
    )}
  />
);
