import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "shadmin-core";
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

import { SupabaseShowGuesser } from "@/components/supabase/show-guesser";

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
  update: async () => ({ data: {} }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

describe("<SupabaseShowGuesser />", () => {
  it("renders inferred fields from the schema", async () => {
    const screen = render(
      <MemoryRouter initialEntries={["/companies/1/show"]}>
        <ThemeProvider>
          <CoreAdminContext
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
          >
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
                      <SupabaseShowGuesser enableLog={false} />
                    </ResourceContextProvider>
                  }
                />
              </Routes>
            </ResourceDefinitionContextProvider>
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await expect
      .element(screen.getByText("Acme", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "https://acme.com" }))
      .toBeInTheDocument();
  });
});
