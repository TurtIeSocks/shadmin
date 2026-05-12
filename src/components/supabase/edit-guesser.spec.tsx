import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
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
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseEditGuesser } from "@/components/supabase/edit-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: { id: 1, name: "Acme", website: "https://acme.com" },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

describe("<SupabaseEditGuesser />", () => {
  it("renders text inputs for the schema's string properties", async () => {
    const screen = render(
      <MemoryRouter initialEntries={["/companies/1"]}>
        <ThemeProvider>
          <CoreAdminContext
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
          >
            <ResourceDefinitionContextProvider
              definitions={{
                companies: { name: "companies", hasEdit: true },
              }}
            >
              <Routes>
                <Route
                  path="/companies/:id"
                  element={
                    <ResourceContextProvider value="companies">
                      <SupabaseEditGuesser enableLog={false} />
                    </ResourceContextProvider>
                  }
                />
              </Routes>
            </ResourceDefinitionContextProvider>
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await expect.element(screen.getByLabelText(/name/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/website/i)).toBeInTheDocument();
  });
});
