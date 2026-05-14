import { useEffect } from "react";
import { type DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, CsvImport } from "@/components/admin";
import { useCsvImport } from "@/components/admin/csv-import";
import { z } from "zod";

const data = {
  products: [
    { id: 1, name: "Notebook", reference: "NB-001", price: 9.99 },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(() => defaultMessages, "en", undefined, {
  allowMissing: true,
});

const ProductSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
});

export default {
  title: "Buttons/CsvImport",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const UploadStep = Basic;

const SeedParsed = ({
  rows,
  headers,
}: {
  rows: Array<Record<string, unknown>>;
  headers: string[];
}) => {
  const { setParsedRows, setHeaders } = useCsvImport();
  useEffect(() => {
    setParsedRows(rows);
    setHeaders(headers);
  }, [rows, headers, setParsedRows, setHeaders]);
  return null;
};

export const PreviewStep = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema}>
              <SeedParsed
                rows={[
                  { Reference: "NB-001", "Product Name": "Notebook", price: "9.99" },
                  { Reference: "", "Product Name": "Broken", price: "not-a-number" },
                ]}
                headers={["Reference", "Product Name", "price"]}
              />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const MapStep = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema}>
              <SeedParsed
                rows={[{ Reference: "NB-001", "Product Name": "Notebook", price: "9.99" }]}
                headers={["Reference", "Product Name", "price"]}
              />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const CommitStep = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema}>
              <SeedParsed
                rows={[
                  { Reference: "NB-001", "Product Name": "Notebook", price: "9.99" },
                ]}
                headers={["Reference", "Product Name", "price"]}
              />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
