import React from "react";
import {
  DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  Admin,
  AppBar,
  AppSidebar,
  Layout,
  ListGuesser,
  ShowGuesser,
  SidebarToggleButton,
  ThemeModeToggle,
  Title,
  TitlePortal,
  UserMenu,
} from "@/components/admin";
import { SidebarProvider } from "@/components/ui/sidebar";

export default {
  title: "UI & Layout/AppBar",
};

const data = {
  posts: [
    { id: 1, title: "Hello world", author: "Leo Tolstoy" },
    { id: 2, title: "Lorem ipsum", author: "Jane Austen" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const CustomLayout = ({ children }: { children?: React.ReactNode }) => (
  <Layout>
    {/* Render Title once to populate the slot in the default AppBar */}
    <Title title="Custom Header" />
    {children}
  </Layout>
);

export const WithCustomTitle = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      layout={CustomLayout}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const MinimalAppBar = () => (
  <AppBar>
    <SidebarToggleButton />
    <TitlePortal />
    <ThemeModeToggle />
    <UserMenu />
  </AppBar>
);

const MinimalLayout = ({ children }: { children?: React.ReactNode }) => (
  <SidebarProvider>
    <AppSidebar />
    <main className="flex-1 flex flex-col">
      <MinimalAppBar />
      <div className="flex-1 px-4">{children}</div>
    </main>
  </SidebarProvider>
);

export const CustomChildren = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      layout={MinimalLayout}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

const ToolbarLayout = ({ children }: { children?: React.ReactNode }) => (
  <Layout
    appBar={() => (
      <AppBar
        toolbar={
          <span className="text-xs text-muted-foreground">Custom toolbar</span>
        }
      />
    )}
  >
    {children}
  </Layout>
);

const UserMenuLayout = ({ children }: { children?: React.ReactNode }) => (
  <Layout
    appBar={() => (
      <AppBar
        userMenu={
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
            admin
          </span>
        }
      />
    )}
  >
    {children}
  </Layout>
);

export const WithCustomUserMenu = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      layout={UserMenuLayout}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const WithCustomToolbar = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      layout={ToolbarLayout}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);
