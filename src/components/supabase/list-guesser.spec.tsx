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
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseListGuesser } from "@/components/supabase/list-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({
    data: [
      {
        id: 1,
        name: "Acme",
        website: "https://acme.com",
        created_at: "2024-01-01",
      },
    ],
    total: 1,
  }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: {} }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

import type { ReactNode } from "react";

type WrapperProps = { children: ReactNode };

const Wrapper = ({ children }: WrapperProps) => (
  <MemoryRouter initialEntries={["/companies"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasList: true },
          }}
        >
          <ResourceContextProvider value="companies">
            {children}
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

describe("<SupabaseListGuesser />", () => {
  it("renders a column for each property of the inferred resource", async () => {
    const screen = render(
      <Wrapper>
        <SupabaseListGuesser enableLog={false} />
      </Wrapper>,
    );
    await expect
      .element(screen.getByRole("cell", { name: "Acme", exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("https://acme.com"))
      .toBeInTheDocument();
  });
});
