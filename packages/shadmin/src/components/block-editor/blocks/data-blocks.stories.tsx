import {
  CoreAdminContext,
  RecordContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import { QueryClient } from "@tanstack/react-query";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { recordListBlock } from "@/components/block-editor/blocks/record-list";
import { chartBlock } from "@/components/block-editor/blocks/chart";

export default { title: "Block Editor/Data Blocks" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const data = {
  products: [
    { id: 1, name: "Widget", category: "tools", price: 10 },
    { id: 2, name: "Gadget", category: "tools", price: 20 },
    { id: 3, name: "Doohickey", category: "toys", price: 5 },
  ],
};
const dataProvider = fakeRestProvider(data, false);
// Disable react-query retries so error states surface immediately in tests.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Frame({ doc }: { doc: unknown }) {
  return (
    <ThemeProvider>
      <TestMemoryRouter>
        <CoreAdminContext
          dataProvider={dataProvider}
          i18nProvider={i18nProvider}
          queryClient={queryClient}
          store={memoryStore()}
        >
          <RecordContextProvider value={{ id: 99 }}>
            <BlockEditor
              editable={false}
              blocks={[recordListBlock, chartBlock]}
              value={doc as never}
            />
          </RecordContextProvider>
        </CoreAdminContext>
      </TestMemoryRouter>
    </ThemeProvider>
  );
}

export const RecordListResolved = () => (
  <Frame
    doc={{
      type: "doc",
      content: [
        {
          type: "recordList",
          attrs: {
            resource: "products",
            perPage: 5,
            fields: ["name", "price"],
          },
        },
      ],
    }}
  />
);
export const RecordListEmpty = () => (
  <Frame
    doc={{
      type: "doc",
      content: [{ type: "recordList", attrs: { resource: "", perPage: 5 } }],
    }}
  />
);

export const ChartResolved = () => (
  <Frame
    doc={{
      type: "doc",
      content: [
        {
          type: "chart",
          attrs: {
            resource: "products",
            type: "bar",
            category: "category",
            value: "price",
            aggregate: "sum",
            perPage: 100,
          },
        },
      ],
    }}
  />
);
export const ChartEmpty = () => (
  <Frame
    doc={{
      type: "doc",
      content: [
        {
          type: "chart",
          attrs: {
            resource: "",
            type: "bar",
            category: "",
            value: "",
            aggregate: "count",
            perPage: 100,
          },
        },
      ],
    }}
  />
);
