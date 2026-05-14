import { type DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, CsvImport } from "@/components/admin";
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
