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
import { SupabaseCreateGuesser } from "@/components/supabase/create-guesser";

export default { title: "Supabase/CreateGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async (_r: unknown, p: { data: unknown }) => ({
    data: { id: 1, ...((p.data as object) ?? {}) },
  }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const CompanyCreate = () => (
  <MemoryRouter initialEntries={["/companies/create"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasCreate: true },
          }}
        >
          <ResourceContextProvider value="companies">
            <SupabaseCreateGuesser />
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
