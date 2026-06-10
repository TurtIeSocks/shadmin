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
import { referenceRecordBlock } from "@/components/block-editor/blocks/reference-record";

export default { title: "Block Editor/Blocks/ReferenceRecord" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const dataProvider = fakeRestProvider(
  { products: [{ id: 1, name: "Widget" }] },
  false,
);

// Disable react-query retries so the MissingRecord (id 999) query settles to
// `error` immediately instead of retrying 3× with backoff (which would keep the
// block stuck on the loading skeleton past the test's retry window).
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Frame = ({ id }: { id: number | null }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
        queryClient={queryClient}
      >
        <RecordContextProvider value={{ id: 99 }}>
          <BlockEditor
            editable={false}
            blocks={[referenceRecordBlock]}
            value={{
              type: "doc",
              content: [
                {
                  type: "referenceRecord",
                  attrs: {
                    resource: "products",
                    id,
                    fields: ["name"],
                    layout: "card",
                  },
                },
              ],
            }}
          />
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export const ResolvedRecord = () => <Frame id={1} />;
export const EmptyRecord = () => <Frame id={null} />;
export const MissingRecord = () => <Frame id={999} />;
