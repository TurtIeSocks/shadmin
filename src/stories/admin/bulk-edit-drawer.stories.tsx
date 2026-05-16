import type { ReactNode } from "react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";

import {
  BulkEditDrawer,
  NumberInput,
  TextInput,
  ThemeProvider,
} from "@/components/admin";

export default { title: "Data Edition/BulkEditDrawer" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const dataProvider = fakeRestProvider(
  {
    products: [
      { id: 1, category: "books", price: 12 },
      { id: 2, category: "books", price: 18 },
    ],
  },
  false,
);

interface WrapperProps {
  children: ReactNode;
  selectedIds?: (string | number)[];
}

const Wrapper = ({ children, selectedIds = [1, 2] }: WrapperProps) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceDefinitionContextProvider
          definitions={{ products: { name: "products" } }}
        >
          <ResourceContextProvider value="products">
            <ListContext.Provider
              value={
                {
                  selectedIds,
                  onUnselectItems: () => {},
                } as never
              }
            >
              {children}
            </ListContext.Provider>
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <BulkEditDrawer label="Edit selected">
      <TextInput source="category" />
      <NumberInput source="price" />
    </BulkEditDrawer>
  </Wrapper>
);

export const Disabled = () => (
  <Wrapper>
    <BulkEditDrawer label="Edit selected" disabled>
      <TextInput source="category" />
    </BulkEditDrawer>
  </Wrapper>
);

export const NoSelection = () => (
  <Wrapper selectedIds={[]}>
    <BulkEditDrawer label="Edit selected">
      <TextInput source="category" />
    </BulkEditDrawer>
  </Wrapper>
);
