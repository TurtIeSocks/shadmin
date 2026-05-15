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

const AutoAdvanceTo = ({ targetStep }: { targetStep: number }) => {
  useEffect(() => {
    const tick = () => {
      const triggers = Array.from(document.querySelectorAll("button"));
      const trigger = triggers.find((b) => /import/i.test(b.textContent ?? ""));
      if (trigger && !document.querySelector('[role="dialog"]')) {
        trigger.click();
      }
      let stepsClicked = 0;
      const clickNext = () => {
        if (stepsClicked >= targetStep - 1) return;
        const nextBtns = Array.from(document.querySelectorAll('[role="dialog"] button'));
        const next = nextBtns.find((b) => /^next$/i.test(b.textContent?.trim() ?? ""));
        if (next) {
          (next as HTMLButtonElement).click();
          stepsClicked += 1;
          setTimeout(clickNext, 100);
        }
      };
      setTimeout(clickNext, 100);
    };
    setTimeout(tick, 50);
  }, [targetStep]);
  return null;
};

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
              <AutoAdvanceTo targetStep={2} />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

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
              <AutoAdvanceTo targetStep={3} />
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
              <AutoAdvanceTo targetStep={4} />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const CommitWithErrors = () => (
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
                  { Reference: "", "Product Name": "Broken", price: "x" },
                ]}
                headers={["Reference", "Product Name", "price"]}
              />
              <AutoAdvanceTo targetStep={4} />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
