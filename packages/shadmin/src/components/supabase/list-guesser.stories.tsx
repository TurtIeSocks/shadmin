import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseListGuesser } from "@/components/supabase/list-guesser";
import { exampleSchema } from "@/components/supabase/__fixtures__";

export default { title: "Supabase/ListGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({
    data: [
      { id: 1, name: "Acme", website: "https://acme.com" },
      { id: 2, name: "Globex", website: "https://globex.com" },
    ],
    total: 2,
  }),
  getOne: async ({ id }: { id: unknown }) => ({ data: { id, name: "Acme" } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async (_r: unknown, params: { data: unknown }) => ({
    data: params.data,
  }),
  updateMany: async () => ({ data: [] }),
  create: async (_r: unknown, params: { data: unknown }) => ({
    data: { id: 1, ...((params.data as object) ?? {}) },
  }),
  delete: async (_r: unknown, params: { previousData?: unknown }) => ({
    data: params.previousData ?? { id: 1 },
  }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const Companies = () => (
  <MemoryRouter initialEntries={["/companies"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasList: true },
          }}
        >
          <ResourceContextProvider value="companies">
            <SupabaseListGuesser />
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export { exampleSchema };
