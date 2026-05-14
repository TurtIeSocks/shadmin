import { useEffect } from "react";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, ListGuesser, ShowGuesser } from "@/components/admin";
import { CommandMenu, useCommandMenu } from "@/components/admin/command-menu";

const data = {
  products: [
    { id: 1, name: "Notebook", reference: "NB-001" },
    { id: 2, name: "Pencil", reference: "PN-002" },
  ],
  orders: [
    { id: 10, reference: "ORD-10", total: 9.99 },
    { id: 11, reference: "ORD-11", total: 19.99 },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const AutoOpen = () => {
  const { open } = useCommandMenu();
  useEffect(() => {
    open();
  }, [open]);
  return null;
};

export default {
  title: "Navigation/CommandMenu",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <Resource name="orders" list={ListGuesser} show={ShowGuesser} />
    </Admin>
    <CommandMenu>
      <AutoOpen />
    </CommandMenu>
  </TestMemoryRouter>
);

export const Hotkey = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
    <CommandMenu />
  </TestMemoryRouter>
);

export const AdminShorthand = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);
