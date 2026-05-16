import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  type AuthProvider,
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
  useStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, ListGuesser, ShowGuesser } from "@/components/admin";
import { CommandMenu } from "@/components/extras/command-menu";
import {
  useCommandMenu,
  useRegisterCommand,
  RECENTS_KEY,
  type RecentEntry,
} from "@/components/extras/command-menu-context";

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
  title: "Extras/CommandMenu",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <AutoOpen />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <Resource name="orders" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const Hotkey = () => (
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

export const AdminShorthand = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <LocationProbe />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const LocationProbe = () => {
  const location = useLocation();
  return (
    <span data-testid="cm-location" hidden>
      {location.pathname}
    </span>
  );
};

const AutoOpenWithQuery = ({ query }: { query: string }) => {
  const { open, setQuery } = useCommandMenu();
  useEffect(() => {
    open();
    setQuery(query);
  }, [open, setQuery, query]);
  return null;
};

export const RecordSearch = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu searchDebounceMs={50}>
          <AutoOpenWithQuery query="Notebook" />
          <LocationProbe />
        </CommandMenu>
      }
    >
      <Resource
        name="products"
        list={ListGuesser}
        show={ShowGuesser}
        recordRepresentation="name"
      />
      <Resource
        name="orders"
        list={ListGuesser}
        show={ShowGuesser}
        recordRepresentation="reference"
      />
    </Admin>
  </TestMemoryRouter>
);

export const BuiltinActions = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <AutoOpen />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const RegisterDuplicateProduct = () => {
  useRegisterCommand({
    id: "demo.duplicate",
    label: "Duplicate product",
    group: "actions",
    onSelect: () => {
      /* no-op for demo */
    },
  });
  return null;
};

export const RegisteredCommand = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <RegisterDuplicateProduct />
          <AutoOpen />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const restrictiveAuthProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  canAccess: async ({ resource }) => resource !== "orders",
};

export const PermissionDenied = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      authProvider={restrictiveAuthProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <AutoOpen />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <Resource name="orders" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const SeedRecents = () => {
  const [, setRecents] = useStore<RecentEntry[]>(RECENTS_KEY, []);
  const { open } = useCommandMenu();
  useEffect(() => {
    setRecents([
      {
        type: "record",
        resource: "products",
        id: 1,
        label: "Notebook",
        path: "/products/1/show",
      },
    ]);
    open();
  }, [open, setRecents]);
  return null;
};

export const Recents = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu={
        <CommandMenu>
          <SeedRecents />
        </CommandMenu>
      }
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);
