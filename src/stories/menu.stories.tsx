import {
  Book,
  MessageCircle,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  Admin,
  ListGuesser,
  Menu,
  Resource,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "Layout/Menu",
};

const data = {
  posts: [{ id: 1, title: "War and Peace" }],
  comments: [{ id: 1, body: "Great book!" }],
  orders: [{ id: 1, reference: "ORD-1" }],
  customers: [{ id: 1, first_name: "Jane", last_name: "Doe" }],
};
const dataProvider = fakeRestDataProvider(data);
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const renderInSidebar = (menu: React.ReactElement) => (
  <SidebarProvider>
    <Sidebar variant="floating">
      <SidebarContent>{menu}</SidebarContent>
    </Sidebar>
    <main className="flex-1 p-4">Main area</main>
  </SidebarProvider>
);

export const Default = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      layout={() => renderInSidebar(<Menu />)}
    >
      <Resource
        name="posts"
        icon={Book}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="comments"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithDashboard = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      dashboard={() => <div>Dashboard view</div>}
      layout={() => renderInSidebar(<Menu />)}
    >
      <Resource
        name="posts"
        icon={Book}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="comments"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Grouped = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      layout={() => renderInSidebar(<Menu />)}
    >
      <Resource
        name="posts"
        group="Content"
        icon={Book}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="comments"
        group="Content"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="orders"
        group="Store"
        icon={ShoppingCart}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="customers"
        icon={Users}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Custom = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      dashboard={() => <div>Dashboard view</div>}
      layout={() =>
        renderInSidebar(
          <Menu>
            <Menu.DashboardItem />
            <Menu.ResourceItem name="posts" />
            <Menu.Item
              to="/settings"
              primaryText="Settings"
              leftIcon={<Settings />}
            />
          </Menu>,
        )
      }
    >
      <Resource
        name="posts"
        icon={Book}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="comments"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);
