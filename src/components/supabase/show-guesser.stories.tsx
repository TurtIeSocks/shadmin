import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseShowGuesser } from "@/components/supabase/show-guesser";

export default { title: "Supabase/ShowGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: {
      id: 1,
      name: "Acme",
      website: "https://acme.com",
      created_at: "2024-01-01T00:00:00Z",
    },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async (_r: unknown, p: { data: unknown }) => ({ data: p.data }),
  updateMany: async () => ({ data: [] }),
  create: async (_r: unknown, p: { data: unknown }) => ({
    data: { id: 1, ...((p.data as object) ?? {}) },
  }),
  delete: async (_r: unknown, p: { previousData?: unknown }) => ({
    data: p.previousData ?? { id: 1 },
  }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const Company = () => (
  <MemoryRouter initialEntries={["/companies/1/show"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasShow: true },
          }}
        >
          <Routes>
            <Route
              path="/companies/:id/show"
              element={
                <ResourceContextProvider value="companies">
                  <SupabaseShowGuesser />
                </ResourceContextProvider>
              }
            />
          </Routes>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
